import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './results.html';

var personList = []; // Aray where Index is submission ID, inside of each index is an array of days and times
var dayList = [];
var eventId;
var startDate;
var timeList;
var timeIndex;

Template.results.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');

  eventId = FlowRouter.getParam('eventId');
  console.log('results templated loaded for id: ' + eventId);


});

Template.results.rendered=function() {

  setTimeout(function() {
    Meteor.call('events.find', eventId, function(error, result){
      if(error)
      {
        console.error(error);
      }
      else {
        console.info(result);
        startDate = result.startDate;
        init(result.submissions);
      }
    });
  }, 1000);

}



Template.results.helpers({
  'event': function() {
    return Events.find({ _id: eventId } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {

    if (Events.find({ _id: eventId } ).count() === 0) {
      return [];
    }
    const endDate = Events.findOne({ _id: eventId } ).endDate;
    let days = [];
    for (let d = new Date(Events.findOne({ _id: eventId } ).startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push( { date: new Date(d) } );
    }
    return days;
  },
});

function init(submissions)
{
  for(let i = 0; i < submissions.length; i += 1)  // For each submission
  {
    let timeList = new TimeList(startDate);
    timeList.import(submissions[i]);
    personList.push(timeList);
    addPersonsTimes(submissions[i].times);
  }

  groovyTimes();
  drawGoodTimes();
}

function addPersonsTimes(times)
{
  for(let i = 0; i < times.length; i += 1)
  {
    //let dayIndex = Math.ceil((new Date(times[i].start).getTime() - startDate.getTime())/(1000*60*60*24));
    let dayIndex = Math.floor(daysBetween(startDate, times[i].start));

    if(dayList[dayIndex] === undefined)
    {
      dayList[dayIndex] = [];
    }

    dayList[dayIndex].push( { time: times[i].start, val: 1 } );
		dayList[dayIndex].push( { time: times[i].end, val: -1 } );
  }
}

function treatAsUTC(date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    let millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function groovyTimes()
{

  for(let day = 0; day < dayList.length; day += 1)
  {
    if(dayList[day] === undefined) { continue; }
    let currDay = new Date(startDate);
    currDay.setDate(currDay.getDate()+day);

  	let t = dayList[day];

  	t.sort(function(a, b) {
  		a = new Date(a.time).getTime();
  		b = new Date(b.time).getTime();
  		return a - b;
  	});

  	let cool = [];
  	cool.push({time: new Date(currDay), chill: 0});
  	let hot = 0;

  	for(let i = 0; i < t.length; i += 1)
  	{
  		hot += t[i].val;
  		cool.push({time: t[i].time, chill: hot});
  	}
  	// set currday for the last possible ms of the day
    // Basically, add a day minus 1ms
    currDay.setMilliseconds(1000*60*60*24 - 1); //1000ms * 60s * 60m * 24h - 1ms
  	cool.push({time: new Date(currDay), chill: 0}); // The 'chill: 0' is uneccessary
    dayList[day] = cool;
  }

}

function drawGoodTimes()
{
  let dayElements = [];

  for(let i = 0; i < dayList.length; i += 1)
  {
    dayElements[i] = $('#day-list')[0].children[i].lastElementChild.firstElementChild;
  }
  for(let day = 0; day < dayList.length; day += 1)
  {
    if(dayList[day] === undefined) { continue; }

  	let t = dayList[day];
    console.log('%c ' + day, 'background: #222; color: #d33');
    for(let i = 0; i < t.length-1; i += 1)
    {
      if(t[i] === undefined) { continue; }

      let time1 = t[i].time,
          time2 = t[i+1].time;
      let h1 = time1.getHours(),
          m1 = time1.getMinutes(),
          h2 = time2.getHours(),
          m2 = time2.getMinutes();

      let start = h1*60+m1;
      let duration = (h2*60+m2) - start;

      console.log('%c ' + h1 + ':' + m1, 'background: #444; color: #bada55');
      console.log('%c ' + t[i].chill, 'background: #ddd; color: #333');

      let minutesInDay = 60*24;

      let div = document.createElement("div");
      div.className = 'line interval';
      div.style.left = ((start)/minutesInDay)*100 + '%';
      div.style.width = ((duration)/minutesInDay)*100 + '%';


      let min=0, max=3;
      let normalizedChill = (t[i].chill - min)/(max-min);
      div.innerText = t[i].chill + "(" + normalizedChill + ")";
      let color = getHeatMapColor(normalizedChill);
      console.info(color);
      div.style.backgroundColor = color;
      dayElements[day].appendChild(div);
    }
  }
}

function getHeatMapColor(value)
{
  const color = [ [1,0,0], [1,0.75,0], [0.75,1,0], [0,1,0] ];
  const NUM_COLORS = color.length;

  let idx1;        // |-- Our desired color will be between these two indexes in "color".
  let idx2;        // |
  let fractBetween = 0;  // Fraction between "idx1" and "idx2" where our value is.

  if(value <= 0)      {  idx1 = idx2 = 0;            }    // accounts for an input <=0
  else if(value >= 1)  {  idx1 = idx2 = NUM_COLORS-1; }    // accounts for an input >=0
  else
  {
    value = value * (NUM_COLORS-1);        // Will multiply value by 3.
    idx1  = Math.floor(value);                  // Our desired color will be after this index.
    idx2  = idx1+1;                        // ... and before this index (inclusive).
    fractBetween = value - idx1;    // Distance between the two indexes (0-1).
  }

  red   = (color[idx2][0] - color[idx1][0])*fractBetween + color[idx1][0];
  green = (color[idx2][1] - color[idx1][1])*fractBetween + color[idx1][1];
  blue  = (color[idx2][2] - color[idx1][2])*fractBetween + color[idx1][2];

  red *= 255;
  green *= 255;
  blue *= 255;

  return `rgb(${~~red}, ${~~green}, ${~~blue})`;
}
function updateAllTimes(dayIndex)
{
  if(dayIndex === undefined)
  {
    dayIndex = timeIndex;
  }
  let times = timeList.getTimes(dayIndex);
	for(let i = 0; i < times.length; i++)
	{
		getTime(times[i]);
	}
}
function getTime(div)
{
	let space = time.getBoundingClientRect();
	let rect = div.getBoundingClientRect();	// the div's rectangle position
	let timeStart, timeEnd;	// Will hold the string represenations of times
	let l = rect.left-space.left;			// left side of div to left side of screen
	let r = rect.right-space.left;			// right side of div to left side of screen
	let w = time.clientWidth;	// screen width

	//Fix edge case errors that result in -1:58AM on the left and 12:01PM on right
	if(l < 0) { l = 0; }
  if(r < 0) { r = 0; }
	if(r > w) { r = w; }
  if(l > w) { l = w; }

	/* Set Ratios */
	let rl = l/w;						// Ratio of left-side of div to screen width
	let rr = r/w;						// Ratio of right-side of div to screen width


	/* Calculate time on left side of time block */
	let suffix = 'AM';
	if(rl >= 0.5) {
		suffix = 'PM';
	}
	let hr = Math.floor(rl*24)%12;
	if(hr == 0)
	{
		hr = 12;
	}
	let min = Math.floor((rl*24 - Math.floor(rl*24)) * 60);
	if(min < 10)
	{
		min = '0' + min;
	}
	timeStart = hr + ':' + min + suffix;

	/* Calculate time on right side of time block */
	suffix = 'AM';
	if(rr >= 0.5) {
		suffix = 'PM'
	}
	hr = Math.floor(rr*24)%12;
	if(hr == 0)
	{
		hr = 12;
	}
	min = Math.floor((rr*24 - Math.floor(rr*24)) * 60);
	if(min < 10)
	{
		min = '0' + min;
	}
	timeEnd = hr + ':' + min + suffix;

	/* Post processing */
  if(l >= w) { timeStart = '11:59PM'; }
	if(r >= w) { timeEnd = '11:59PM'; }

	// Create div to contain the times
	let timeDiv = document.createElement('div');
	timeDiv.className = 'time-text-container';
	timeDiv.innerHTML = `${timeStart}<br>${timeEnd}`;
	// Remove all children from time block to cleanly add the new time text
	while(div.firstChild)
	{
		div.removeChild(div.firstChild);
	}
	div.appendChild(timeDiv);
}
function getChildIndex(time)
{
  let child = time.parentNode.parentNode;
  let parent = child.parentNode;
  timeIndex = Array.prototype.indexOf.call(parent.children, child);
  return timeIndex;
}
