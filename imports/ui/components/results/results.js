import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './results.html';

var personList = []; // Aray where Index is submission ID, inside of each index is an array of days and times
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
    /*
    for(let j = 0; j < submissions[i].times.length; j += 1)// For each datetime range in that submission
    {
      let time = submissions[i].times[j];
      console.info(time.start + " through " + time.end);
    }
    */
  }
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
