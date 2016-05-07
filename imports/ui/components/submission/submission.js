import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Events } from '/imports/api/events.js';
import './submission.html';

times = [];
var time;
var timeIndex;
var timeList;

Template.submission.onCreated(function bodyOnCreated() {
  Meteor.subscribe('events');
  console.log('submission templated loaded for id: ' + FlowRouter.getParam("eventId"));
  timeList = new TimeList();
});

Template.submission.events({
  'mousemove .time-box'(event, target) {

    if(event.target.classList.contains('time-box') && time != event.target)
    {
      time = event.target;
      //var date = time.previousElementSibling.textContent.trim();

      timeIndex = getChildIndex(time);
      console.info(timeIndex);
    }

    drawline(event);

  },
});

Template.submission.helpers({
  'event': function() {
    return Events.find({ _id: FlowRouter.getParam("eventId") } );
  },
  'formatDate': function(date) {
    return new Date(date).toDateString();
  },
  'day': function() {
    const eventId = FlowRouter.getParam("eventId");
    if (Events.find({ _id: eventId } ).count() == 0) {
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
  constructor() {
    this.days = [];
  }

  addTime(dayIndex, time)
  {
    // If there is no data for that day, create it
    if(this.days[dayIndex] === undefined)
    {
      this.days[dayIndex] = [];
    }
    this.days[dayIndex].push(time);
  }

  removeTime(dayIndex, time)
  {
    let timeIndex = this.days[dayIndex].indexOf(time);
    if(timeIndex === -1)
    {
      return false;
    }
    this.days[dayIndex].splice(timeIndex, 1);
  }

  getTimes(dayIndex)
  {
    return this.days[dayIndex];
  }
}

div = null;
var startX, diff;
var holding = false;
function drawline(event)
{
	if(event.buttons == 1 || event.buttons == 4)
	{
		if(!holding)
		{
			if(div != null)
			{
        timeList.addTime(timeIndex, div);
			}
			div = document.createElement("div");
			if(event.buttons == 1) {
				div.className = "line good";
			} else if (event.buttons == 4) {
				div.className = "line bad";
				event.preventDefault();
			}

			time.appendChild(div);
			holding = true;
		}
		diff = event.clientX-startX;
    let rect = time.getBoundingClientRect();
		div.style.width = Math.abs(diff) + "px";
		if(diff < 0)
		{
			div.style.left = event.clientX-rect.left + "px";
		} else {
			div.style.left = (event.clientX-diff-rect.left) + "px";
		}
		getTime(div);
	}
	else
	{
		if(holding == true)
		{
      timeList.addTime(timeIndex, div);
			div = null;
			cleanupOverlaps();
			updateAllTimes();
			holding = false;
		}
		startX = event.clientX;
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
			if (i != j) {
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
		else if(rect1.left <= rect2.left)	// div2 overlaps div1 on div1's right side
		{
			console.error(rect1.left == rect2.left);
			timeList.removeTime(timeIndex, div2);
      timeList.removeTime(timeIndex, div1);

			div1.style.width = (rect2.width+rect2.left - rect1.left) + "px";
			div2.remove();

      timeList.addTime(timeIndex, div1);
			success = true;
		}
		else if(rect1.left > rect2.left) // div1 overlaps div2 on div2's right side
		{
      timeList.removeTime(timeIndex, div2);
      timeList.removeTime(timeIndex, div1);

			div2.style.width = (rect1.width+rect1.left - rect2.left) + "px";
			div1.remove();

      timeList.addTime(timeIndex, div2);
			success = true;
		}
	}
	return success;
}
function updateAllTimes()
{
  let times = timeList.getTimes(timeIndex);
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
	if(r > space.width) { r = space.width; }

	/* Set Ratios */
	let rl = l/w;						// Ratio of left-side of div to screen width
	let rr = r/w;						// Ratio of right-side of div to screen width


	/* Calculate time on left side of time block */
	let suffix = "AM";
	if(rl >= 0.5) {
		suffix = "PM";
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
	timeStart = hr + ":" + min + suffix;

	/* Calculate time on right side of time block */
	suffix = "AM";
	if(rr >= 0.5) {
		suffix = "PM"
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
	timeEnd = hr + ":" + min + suffix;

	/* Post processing */
	if(r >= space.width) { timeEnd = "11:59PM"; }

	// Create div to contain the times
	let timeDiv = document.createElement("div");
	timeDiv.className = "time-text-container";
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
  let child = time.parentNode;
  let parent = child.parentNode;
  timeIndex = Array.prototype.indexOf.call(parent.children, child);
  return timeIndex;
}
