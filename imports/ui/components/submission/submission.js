import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './submission.html';

/* GLOBALS */
var time,
  timeIndex,
  tempTimeIndex,
  timeList,
  div = null,
  startX,
  diff,
  holding = false;
/* End GLOBALS */

Template.submission.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');
  console.log('submission templated loaded for id: ' + FlowRouter.getParam('eventId'));
  timeList = new TimeList();
});

Template.submission.events({
  'mousemove .time-box'(event, target) {
    if(event.target.classList.contains('time-box') && time !== event.target)
    {
      time = event.target;

      tempTimeIndex = getChildIndex(time);
    }
    drawline(event);
  },
  'click .floating-submit-button'() {
    console.info(timeList.export());
  },
});

Template.submission.helpers({
  'event': function() {
    return Events.find({ _id: FlowRouter.getParam('eventId') } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    const eventId = FlowRouter.getParam('eventId');
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





class TimeList {
  function constructor(startDate) {
    this.days = [];
    this.startDate = startDate; //This is a String, not a Date object
  }

  function addTime(dayIndex, time)
  {
    // If there is no data for that day, create it
    if(this.days[dayIndex] === undefined)
    {
      this.days[dayIndex] = [];
    }
    this.days[dayIndex].push(time);
  }

  function removeTime(dayIndex, time)
  {
    let timeIndex = this.days[dayIndex].indexOf(time);
    if(timeIndex === -1)
    {
      return false;
    }
    this.days[dayIndex].splice(timeIndex, 1);
  }

  function getTimes(dayIndex)
  {
    return this.days[dayIndex];
  }

  function export() {
    let currDay;
    let data = { name: 'Nick', times: [], };
    const dayList = $('#day-list')[0];

    for(i in this.days)  // For each day
    {
      // Sets the current day to correct day based on the index of the array we are at
      currDay = new Date(dayList.children[i].firstElementChild.innerText);

      // Goes through each time in the current day
      for(j in this.days[i])  // For each time block in the day
      {
        let [startMin, endMin] = this.getMinutes(this.days[i][j]);

        let startTime = new Date(currDay.getTime()),
            endTime   = new Date(currDay.getTime());

        startTime.setMinutes(startMin);
        endTime.setMinutes(endMin);

        let newData = {start: startTime, end: endTime, check: 'hi',};

        data.times.push(newData);
      }
    }
    console.info('Export Finished.');
    return data;
  }

  function import(data)
  {
    this.startDate = $('#start-date').text();
    const dayList = $('#day-list')[0];
    const dayCount = dayList.children.length;
    let dayElements = [];
    for(let i = 0; i < dayCount; i += 1)
    {
      dayElements[i] = dayList.children[i].lastElementChild.firstElementChild;
    }
    const times = data.times;
    const minutesInDay = 60*24;
    const dayWidth = dayElements[0].clientWidth;
    for(let i = 0; i < times.length; i += 1)
    {
      if(times[i] === undefined) { continue; }

      let startTime = new Date(times[i].start);
      let endTime = new Date(times[i].end);

      let dayIndex = startTime.getDate() - new Date(this.startDate).getDate();

      startTime = startTime.getHours()*60 + startTime.getMinutes();
      endTime = endTime.getHours()*60 + endTime.getMinutes();

      let div = document.createElement('div');
      div.className = 'line good';
      div.style.left = (startTime/minutesInDay)*100 + '%';
      div.style.width = ((endTime-startTime)/minutesInDay)*100 + '%';
      this.addTime(dayIndex, div);

      dayElements[dayIndex].appendChild(div);
      updateAllTimes(dayIndex);
    }

    console.info('Import finished.');
  }

  function getMinutes(div)
  {
    let space = $('.time-box')[0].getBoundingClientRect();
  	let rect = div.getBoundingClientRect();	// the div's rectangle position
  	let timeStart, timeEnd;	// Will hold the time in minutes
  	let l = rect.left-space.left;			// left side of div to left side of screen
  	let r = rect.right-space.left;			// right side of div to left side of screen
  	let w = $('.time-box')[0].clientWidth;	// screen width

  	//Fix edge case errors that result in -1:58AM on the left and 12:01PM on right
  	if(l < 0) { l = 0; }
    if(r < 0) { r = 0; }
  	if(r > w) { r = w; }
    if(l > w) { l = w; }

  	/* Set Ratios */
  	let rl = l/w;						// Ratio of left-side of div to screen width
  	let rr = r/w;						// Ratio of right-side of div to screen width

    const minutesInDay = 24 * 60;
    timeStart = rl * minutesInDay;
    timeEnd = rr * minutesInDay;

    // To fix the end of the day being 12:00PM when it should be 11:59PM
    if(l === w) { timeStart -= 1; }
    if(r === w) { timeEnd -= 1; }

    return [timeStart, timeEnd];
  }
}




function drawline(event)
{
	if(event.buttons === 1 || event.buttons === 4)
	{
		if(!holding)
		{
			if(div !== null)
			{
        timeList.addTime(timeIndex, div);
			}
			div = document.createElement('div');
			if(event.buttons === 1) {
				div.className = 'line good';
			} else if (event.buttons === 4) {
				div.className = 'line bad';
				event.preventDefault();
			}

			time.appendChild(div);
			holding = true;
		}
		diff = event.clientX-startX;
    let rect = time.getBoundingClientRect();
		div.style.width = Math.abs(diff/rect.width)*100 + '%';
		if(diff < 0)
		{
			div.style.left = ((event.clientX-rect.left)/rect.width)*100 + '%';
		} else {
			div.style.left = ((event.clientX-rect.left-diff)/rect.width)*100 + '%';
		}
		getTime(div);
	}
	else
	{
		if(holding === true)
		{
      timeList.addTime(timeIndex, div);
			div = null;
			cleanupOverlaps();
			updateAllTimes();
			holding = false;
		}
		startX = event.clientX;
    timeIndex = tempTimeIndex;
	}
	return false;
}
function cleanupOverlaps()
{
let times = timeList.getTimes(timeIndex);
	for(let i = 0; i < times.length; i++)
	{
		for(let j = 0; j < times.length; j++)
		{
			if (i !== j) {
				if (overlap(times[i], times[j])) {
					i = 0;
					j = 0;
				}
			}
		}
	}
}
function overlap(div1, div2)
{
	let success = false;
	let rect1 = div1.getBoundingClientRect();
	let rect2 = div2.getBoundingClientRect();
	if(!(rect1.right < rect2.left || rect1.left > rect2.right ))	// If there is an overlap
	{
		if(rect2.right < rect1.right && rect2.left > rect1.left)	// div1 contains div2
		{
			div2.remove();
      timeList.removeTime(timeIndex, div2);
			success = true;
		}
		else if(rect1.right < rect2.right && rect1.left > rect2.left)	// div2 contains div1
		{
			div1.remove();
      timeList.removeTime(timeIndex, div1);
			success = true;
		}
		else if(rect1.left < rect2.left)	// div2 overlaps div1 on div1's right side
		{
			timeList.removeTime(timeIndex, div2);
      timeList.removeTime(timeIndex, div1);

			div1.style.width = ((rect2.width+rect2.left - rect1.left)/time.clientWidth)*100 + '%';
			div2.remove();

      timeList.addTime(timeIndex, div1);
			success = true;
		}
		else if(rect1.left > rect2.left) // div1 overlaps div2 on div2's right side
		{
      timeList.removeTime(timeIndex, div2);
      timeList.removeTime(timeIndex, div1);

			div2.style.width = ((rect1.width+rect1.left - rect2.left)/time.clientWidth)*100 + '%';
			div1.remove();

      timeList.addTime(timeIndex, div2);
			success = true;
		}
    else if(rect1.left === rect2.left)
    {
      if(rect1.width >= rect2.width) {
        timeList.removeTime(timeIndex, div2);
        div2.remove();
      }
      else {
        timeList.removeTime(timeIndex, div1);
        div1.remove();
      }
      success = true;
    }
	}
	return success;
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
