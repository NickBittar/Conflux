
const day = document.getElementById("block");
//const dayObj = new Day(day);
const dateRange = new DateRange(new Date('2016-06-01'), new Date(), 9, 17);

init();
function init() {
  let container = document.querySelector('.container');
  let startDate = new Date(dateRange.startDate.getTime());
  const days = document.querySelectorAll('.block');
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  let i = 0;
  while(startDate.getTime() <= dateRange.endDate.getTime()) {
    let div = document.createElement('div');
    div.className = 'block';
    div.id = 'block';
    div.innerText = startDate;
    container.appendChild(div);
    dateRange.days.push(new Day(i++, startDate, div, dateRange.startTime, dateRange.endTime));
    // make tick marks
    let ticks = document.createElement('div');
    ticks.className = 'time-marks';
    for(let j = dateRange.startTime; j <= dateRange.endTime; j++) {
      let span = document.createElement('span');
      span.className = 'time-mark';
      if(j <= 12) {
        span.innerText = j;
      } else {
        span.innerText = j-12;
      }
      if(j === 12) {
        span.innerHTML += '<br>PM';
      }
      ticks.appendChild(span);
    }
    container.appendChild(ticks);

    startDate.setDate(startDate.getDate()+1);
  }
}

/* EVENT LISTENERS */
window.addEventListener('mousedown', mDown, false);
window.addEventListener('mousemove', mMove, false);
window.addEventListener('mouseup', mUp, false);
window.addEventListener('touchstart', mDown, false);
window.addEventListener('touchmove', mMove, false);
window.addEventListener('touchend', mUp, false);

window.addEventListener('wheel', scroll, false);



///
//////
////////////
/////////////////////////
//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function DateRange(startDate, endDate, minTime, maxTime) {
  this.days = [];             // An Array of the days in the daterange
  this.startDate = startDate; // The starting date of the daterange
  this.endDate = endDate;     // The ending date of the daterange
  this.startTime = minTime;   // The earliest hour of the event (0-23)
  this.endTime = maxTime;     // The latest hour of the event (1-24)

  this.currTimeBlock = null;  // Used to keep track of the timeblock currently being interacted with
  this.currDay = null;        // To keep track of the current day being interacted with

  /**
   *  Adds a new timeblock to a day for the daterange
   *  int: dayIndex is the index of the day the timeblock is being added to
   *  obj: The timeblock to add
   */
  this.add = function(dayIndex, timeBlock) {
    /* @deprecated: all day objects are instantiated on DateRange creation */
    // Check if a day object does not exist for the dayIndex
    if(this.days[dayIndex] === undefined) {
      console.error('Adding timeblock to day that does not exist yet.');
      // Create the day obj since it doesn't exist
      this.days[dayIndex] = new Day(dayIndex);
    }
    /* @endDeprecation */
    // Add the timeblock to the day
    this.days[dayIndex].add(timeBlock);
  };

  /**
   *  Removes a given timeblock from the specified day
   *  int: dayIndex is the index of the day the timeblock is in (deprecated?)
   *  obj: timeBlock is the timeblock to remove
   */
  this.remove = function(dayIndex, timeBlock) {
    // Find the index of the given timeBlock in the given day's Array of timeblocks
    let timeIndex = this.days[dayIndex].indexOf(timeBlock);
    // If the timeblock doesn't exist return false
    if(timeIndex === -1) {
      console.error('Tried to remove a timeblock that could not be found.');
      return false;
    }
    // Splice out the timeblock at its index for the given dayIndex
    this.days[dayIndex].splice(timeIndex, 1);
  };

  /**
   *  Sets the current time block that is being interacted with.
   *  obj: timeBlock is the timeblock being interacted with.
   */
  this.setCurrTimeBlock = function(timeBlock) {
    this.currTimeBlock = timeBlock;
  }
  /**
   *  Checks if there is a current time block being interacted with.
   *  return: true if there is a current time block, false otherwise.
   */
  this.currTimeIsSet = function() {
    return this.currTimeBlock !== null;
  }
  /**
   *  Clears the current time block pointer.
   */
  this.clearCurrTimeBlock = function() {
    this.currTimeBlock = null;
  }

  /**
   *  gets the day object at the given day index.
   *  int/ele: dayIndex is the index of the day to get or the DOM element of the day wanted.
   *  return: the day object at the given dayIndex, if it could not be found returns false.
   */
  this.getDay = function(dayIndex) {
    // If we have the index of the day, we return the Day object at that index.
    if(typeof(dayIndex) === 'number') {
      return this.days[dayIndex];
    }
    // If we were given the element of the day we go through all the days to find its Day object.
    for(let i = 0; i < this.days.length; i++) {
      if(this.days[i].element === dayIndex) {
        return this.days[i];
      }
    }
    // Could not find anything
    console.error('Could not get day given dayIndex=' + dayIndex);
    return false;
  };


  /**
   *  UNTESTED
   *  TODO: this
   */
  this.export = function(eventId, name) {
      let currDay;
      let data = { eventId, name, times: [], };

      for(let i in this.days)  // For each day
      {
        // Sets the current day to correct day based on the index of the array we are at
        currDay = new Date(this.startDate);
        currDay.setDate(currDay.getDate()+i);

        // Goes through each time in the current day
        for(j in this.days[i])  // For each time block in the day
        {
          let [startMin, endMin] = this.getMinutes(this.days[i].times[j].element);

          let startTime = new Date(currDay.getTime()),
              endTime   = new Date(currDay.getTime());

          startTime.setMinutes(startMin);
          endTime.setMinutes(endMin);

          let newData = {start: startTime, end: endTime,};

          data.times.push(newData);
        }
      }
    return data;
  };

  /**
   *  WILL BE REPLACED BY TIMEBLOCK FUNCTION
   */
  this.getMinutes = function(div)
  {
    console.warn('GETMINUTES CALLED ON', div);
    let space = document.getElementById('block').getBoundingClientRect();
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
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////////////////
////////////
//////
///



///
//////
////////////
/////////////////////////
//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function Day(index, date, element, minTime, maxTime) {
  this.times = [];          // An array of all the timeblocks for the day
  this.dayIndex = index;    // The index this day is in the daterange
  this.date = date;         // This day's date
  this.element = element;   // The DOM element that represents this
  this.startTime = minTime; // The earliest hour the day begins at (0-23) inclusive
  this.endTime = maxTime;   // The latest hour the day ends at (1-24)     exclusive

  // Methods
  /**
   *  Creates a new timeblock.
   *  event: The event that caused the timeblock to be created
   */
  this.createNewTime = function(event) {
    // Create the new TimeBlock object
    const timeBlock = new TimeBlock(this.element, this, event);
    timeBlock.drawTime();
    // and add it to the times for this day
    this.add(timeBlock);
    // Returns the timeblock, as it will probably be what we will be interacting with
    return timeBlock;
  };

  /**
   *  Adds a timeblock to this day's array of times.
   *  obj: timeBlock is a timeblock for this day
   */
  this.add = function(timeBlock) {
    // Push the timeblock to this day's array of times
    this.times.push(timeBlock);
  };

 /**
  *  Removes the time block from the DOM and its day's times array.
  *  obj: timeBlock is the timeBlock to delete
  */
  this.delete = function(timeBlock) {
    // Delete HTML element from DOM
    timeBlock.element.remove();
    // Remove and return the timeBlock obj
    return this.times.splice(this.times.indexOf(timeBlock), 1);
  };

  /**
   *  Finds the TimeBlock object of the given DOM element.
   *  DOM: element is a timeblock html element
   *  return: the TimeBlock object of the given HTML DOM element
   */
  this.find = function(element) {
    // Handles if the element is a component of the timeblock
    if(element.className.includes('handle') || element.className.includes('time-indicator')) {
      element = element.parentElement;
    }
    // Go through each TimeBlock object in the day
    for (let timeBlock of this.times) {
      // If one of the TimeBlock's element is equal to the given element
      if(timeBlock.element === element) {
        // Then this is the element's corresponding TimeBlock object
        return timeBlock;
      }
    }
    // Nothing is found
    console.error('Tried to find the TimeBlock of the element: ', element);
    return null;
  };

  /**
   *  Goes through each pair of TimeBlocks to see if any are overlapping and simplifies them.
   */
  this.cleanupOverlaps = function ()
  {
  const times = this.times;
    for(let i = 0; i < times.length; i++)
    {
      for(let j = 0; j < times.length; j++)
      {
        if (i !== j) {
          if(!times[i].deleting && !times[j].deleting) { // make sure one of the divs is not deleting
            if (this.overlap(times[i], times[j])) {
              i = 0;
              j = 0;
            }
          }
        }
      }
    }
  };

  /**
   *  Given two TimeBock objects, it checks their DOM rectangles to see if they are overlapping.
   *  If they are overlapping, it properly handles the absorption/deletion of them.
   *  obj: div1 and div2 are TimeBlock objects to check if overlapping and handle it.
   *  return true if there was an overlap and was handled, false if there was no overlap
   */
  this.overlap = function(div1, div2)
  {
    let success = false;
    const rect1 = div1.element.getBoundingClientRect();
    const rect2 = div2.element.getBoundingClientRect();
    if (!(rect1.right < rect2.left || rect1.left > rect2.right ))	// If there is an overlap
    {
      if (rect2.right < rect1.right && rect2.left > rect1.left)	// div1 contains div2
      {
        this.delete(div2);
        success = true;
      }
      else if (rect1.right < rect2.right && rect1.left > rect2.left)	// div2 contains div1
      {
        this.delete(div1);
        success = true;
      }
      else if (rect1.left < rect2.left)	// div2 overlaps div1 on div1's right side
      {
        div1.width = rect2.width + rect2.left - rect1.left;
        div1.updateDOM();
        this.delete(div2);
        success = true;
      }
      else if (rect1.left > rect2.left) // div1 overlaps div2 on div2's right side
      {
        div2.width = rect1.width + rect1.left - rect2.left;
        div2.updateDOM();
        this.delete(div1);
        success = true;
      }
      else if (rect1.left === rect2.left)
      {
        if (rect1.width >= rect2.width) {
          this.delete(div2);
        }
        else {
          this.delete(div1);
        }
        success = true;
      }
    }
    return success;
  };
}
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////////////////
////////////
//////
///



///
//////
////////////
/////////////////////////
//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function TimeBlock(day, dayObj, event, minWidth) {
  let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
  let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
  // Properties
  this.day = day;           // The DOM element of the day the timeblock is inside of
  this.dayObj = dayObj;     // The Day object this timeblock belongs to
  this.startX = clientX - day.offsetLeft - 20;  // The start Xpos, for finding differences in Xs
  this.lastX = this.startX; // The previous X position
  this.lastY = clientY;     // The previous Y position
  this.dx = 0;              // The amount of displacement in the X axis
  this.left = this.startX;  // The X val of left side of the timeblock
  this.width = 40;          // The width of the timeblock
  this.minWidth = minWidth || 0; // The minimum width the timeblock can be
  this.pan = false;	        // Used for modifying the time block.
  this.cursorOffset = 0;    // The difference in where interaction is from left side of element
  this.startY = 0;          // The starting Y position for timeblock
  this.screenY = 0;         // The Y displacement of the timeblock
  this.targetY = 0;         // The Y position to head towards, either back to 0, or out off day
  this.resetting = false;   // Whether or not the Y position is reseting back to normal
  this.deleting = false;    // Whether or not the current timeblock is currently being deleted
  this.scrollTarget = null; // Keep track which component of the timeblock being interacted with

  // Create the HTML element for this timeblock
  this.element = document.createElement('div'); // The html DOM element associated with this
  // Sets the element's appropriate classname and left position
  this.element.className = 'time-block';
  this.element.style.left = this.left + 'px';
  // Adds the element to the DOM
  this.day.appendChild(this.element);

  // Create the handles of the timeblock
  this.leftHandle = document.createElement('div');
  this.leftHandle.className = 'handle left';
  this.rightHandle = document.createElement('div');
  this.rightHandle.className = 'handle right';
  this.element.appendChild(this.leftHandle);
  this.element.appendChild(this.rightHandle);

  // Constants
  this.fineMovementY = this.day.offsetTop + this.day.offsetHeight + 200;  // The Y pos threshold

  // Methods
  /**
   *  The big method to handle the interactions with the timeblock
   */
  this.update = function(event) {
    if(this.resetting) { return; }

    // Get the cursor's XY-position
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;

    let newX = clientX;

    // Handles deleting time-blocks (swiping up)
    if(this.pan) {
      this.screenY = clientY - this.startY;
      this.screenY = Math.min(0, this.screenY);
      this.lastY = clientY;
      this.element.style.transform = `translateY(${this.screenY}px)`;
      const normalizedDragDistance = Math.abs(this.screenY / this.element.offsetHeight);
      const opacity = 1 - Math.pow(normalizedDragDistance, 3);
      this.element.style.opacity = opacity;
    }

    // Handles scrub speed reduction when cursor is below time block
    if (clientY > this.fineMovementY) {
      console.debug('sloooow');
      let reduction = (1 - (clientY-this.fineMovementY)/300);	// 300 is arbitrary
      if (reduction > 1) { reduction = 1; }
      if (reduction < 0) { reduction = 0; }

      //dx += event.movementX*reduction;	// Can delete, was trying to replace 'movementX'
      this.dx += (newX - this.lastX) * reduction;

    } else {
      this.dx = newX-this.day.offsetLeft - this.startX;
    }
    this.lastX = newX;
    if (this.pan) {
      this.panBlock();
    } else if (this.expandLeft) {
      this.expandLeftBlock();
    } else if (this.expandRight) {
      this.expandRightBlock();
    } else {
      // Determines how the time block changes
      if (this.dx > 0) {
        this.left = this.startX;
      } else if (this.dx < 0) {
        this.left = this.dx + this.startX;
      }
      this.width = Math.abs(this.dx);
    }

    // Check if timeblock is out of the bounds of the day
    this.adjustBounds();
    // Updates its DOM element to reflect its current state
    this.updateDOM();
    // Set and draw the start and end times label of the timeblock
    this.drawTime();
  };

  /**
   *  Checks if the timeblock is outside the bounds of the day and corrects it.
   *  return: True if it made an adjustment, false otherwise.
   */
  this.adjustBounds = function() {
    // check left side
    if(this.left < 0) {
      if(!this.pan) {
        this.width += this.left;
      }
      this.left = 0;
      return true;
    }
    // Check right side
    if(this.width+this.left > this.day.offsetWidth) {
      if(!this.pan) {
        this.width = this.day.offsetWidth-this.left;
      } else {
        this.left = this.day.offsetWidth-this.width;
      }
      return true;
    }
    return false;
  };

  /**
   *  Moves the whole timeblock with the cursor without modifying the width
   */
  this.panBlock = function() {
    this.left = this.startX + this.dx - this.cursorOffset;
  };

  /**
   *  Modifies the left side of the timeblock because the user is interacting with its left handle
   */
  this.expandLeftBlock = function() {
    let newLeft, newWidth; // new left and width
    newLeft = this.dx + this.startX - this.cursorOffset;
    newWidth = Math.abs(this.dx) + this.cursorOffset;

    // Only update if the left handle stays on left side
    if(this.startX - newLeft >= 2*this.leftHandle.offsetWidth) {
      this.left = newLeft;
      this.width = newWidth;
    } else { // Left is trying to go over right side, so stop it
      this.left = this.startX - 2*this.leftHandle.offsetWidth;
      this.width = 2*this.leftHandle.offsetWidth;
    }
  };

  /**
   *  Modifies the right side of the timeblock because the user is interacting with its right handle
   */
  this.expandRightBlock = function() {
    let newWidth;
    newWidth = this.dx - this.cursorOffset;

    // Handles when the right handle tries to overlap the left one
    if(newWidth >= 2*this.rightHandle.offsetWidth) {
      this.width = newWidth;
    } else {
      this.width = 2*this.rightHandle.offsetWidth;
    }
  };

  /**
   *  Updates the timeblock's DOM element to reflect its left and width property values.
   */
  this.updateDOM = function() {
    this.element.style.left = (this.left/this.day.offsetWidth)*100 + '%';
    this.element.style.width = (this.width/this.day.offsetWidth)*100 + '%';
  };

  /**
   *  Picks up from a mouseDown or touchStart event to begin the creation of the timeblock.
   */
  this.startInteraction = function(event) {
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
    this.scrollTarget = event.target.className;
    if(event.target.className === 'time-block' || event.target.className === 'time-indicator') {
      this.pan = true;
      this.cursorOffset = clientX - this.left - this.day.offsetLeft;
      this.startY = clientY;
    } else if (event.target.className.includes('handle')) {
      // Modifying one of the sides of a time block
      if (event.target.className.includes('left')) {
        this.cursorOffset = clientX - this.left - this.day.offsetLeft;
        this.startX = this.left+this.width;
        this.expandLeft = true;
        this.expandRight = false;
      } else {
        this.cursorOffset = clientX - (this.left+this.width) - this.day.offsetLeft;
        this.startX = this.left;
        this.expandLeft = false;
        this.expandRight = true;
      }
    }
    this.element.style.zIndex = 1;
  };

  /**
   *  Picks up from the mouseUp or touchEnd event to end the interaction with this timeblock.
   */
  this.endInteraction = function(event) {
    this.pan = false;
    this.cursorOffset = 0;
    this.scrollTarget = null;
    this.expandLeft = this.expandRight = false;
    this.element.style.zIndex = 0;
    let clientY = event.clientY !== undefined ? event.clientY : this.lastY;
    if (this.startY - clientY > this.element.offsetHeight * 0.4) {
      this.targetY = 200;
      this.deleting = true;
    } else {
      this.targetY = 0;
      this.deleting = false;
    }
    this.resetYPos();
    this.updateDOM();
    this.drawTime();
  };

  /**
   *  The time block needs to either be brought down to its normal Y position or fly up out of its
   *  day to disapear and be deleted.
   */
  this.resetYPos = function() {
    if(!(Math.abs(this.screenY) < this.targetY + 0.1 && Math.abs(this.screenY) > this.targetY - 0.1)) {
      this.resetting = true;
      this.screenY = (this.screenY - this.targetY) / 2;
      this.element.style.transform = `translateY(${this.screenY}px)`;
      const normalizedDragDistance = Math.abs(this.screenY / this.element.offsetHeight);
      const opacity = 1 - Math.pow(normalizedDragDistance, 3);
      this.element.style.opacity = opacity;
      let that = this;
      setTimeout(that.resetYPos.bind(that), 32);
      //setTimeout(this.resetYPos, 1000);
    } else {
      if(this.resetting && this.targetY > 0) {
        this.dayObj.delete(this);
      }
      this.resetting = false;
    }
  };

  /**
   *  Creates the DOM element of the label showing the start and end times for the timeblock.
   */
  this.drawTime = function() {
    let [startTime, endTime] = this.getTimeRange();
    let div = document.createElement('div');
    div.className = 'time-indicator';
    div.innerText = startTime + ' - ' + endTime;
    //remove existing times
    while(this.element.childElementCount > 2) {
      this.element.children[2].remove();
    }

    //and add the new one
    this.element.appendChild(div);
  };
  /**
   *  Get the start and end times of this timeblock.
   *  return: an array containing the starting time and the ending time of the timeblock.
   */
  this.getTimeRange = function() {
    let startTime = this.left / this.day.offsetWidth;
    let endTime = (this.left+this.width) / this.day.offsetWidth;
    startTime = this.formatTime(startTime);
    endTime = this.formatTime(endTime);
    return [startTime, endTime];
  };

  /**
   *  Formats a time from a percent to an actual 12HR time(e.g. 0.5 => 12:00PM)
   *  dbl: time is a number between 0 and 1 representing the position in the day.
   *  return: the formatted string of the time.
   */
  this.formatTime = function(time) {
    // time will be a number between 0 and 1
    time = Math.max(0, time);
    time = Math.min(time, 1);

    // for customizable time ranges for days (eg: between 9am and 5pm [9 - 17])
    let minTime = this.dayObj.startTime;
    let maxTime = this.dayObj.endTime;
    let deltaTime = maxTime-minTime;
    let minPct = minTime / 24;
    let timePct = (deltaTime*time)/24 + minPct;
    time = timePct;


    let suffix;
    let hour, min;
    if(time < 0.5) {
      suffix = "AM";
    } else {
      suffix = "PM";
    }

    hour = Math.floor(time * 24);
    min = Math.floor((time*24 - hour)*60);

    // pad minutes with leading 0 for single digit minutes
    if(min.toString().length === 1) {
      min = '0' + min;
    }
    // For 12Hr times, not military
    if(hour > 12) {
      hour -= 12;
    }

    // So the start of the day is 12:00AM and not 0:00AM
    if(hour === 0) {
      hour = 12;
    }

    let formattedTime = hour + ':' + min + suffix;
    // to avoid confusions
    if(time > 0.9 && formattedTime === '12:00PM') {
      formattedTime = '11:59PM';
    }
    return formattedTime;
  };

  /**
   *  Changes the timeblock by a single minute increment with each scroll tick.
   */
  this.increment = function(event) {
    let minIncrement = this.day.offsetWidth / (24*60);
    if(this.scrollTarget === null) {
      this.scrollTarget = event.target.className;
    }
    let direction = Math.sign(-event.deltaY || event.deltaX);
    minIncrement = direction * minIncrement;
    switch(this.scrollTarget) {
      case 'time-block':
      case 'time-indicator':
        this.left += minIncrement;
        // Only if there is no bounds error update cursorOffset
        if(!this.adjustBounds()) {
          this.cursorOffset -= minIncrement;
        }
        break;
      case 'handle left':
        this.left += minIncrement;
        this.width += -minIncrement;
        // Only if there is no bounds error update cursorOffset
        if(!this.adjustBounds()) {
          this.cursorOffset -= minIncrement;
        }
        break;
      case 'handle right':
        this.width += minIncrement;
        // Only if there is no bounds error update cursorOffset
        if(!this.adjustBounds()) {
          this.cursorOffset -= minIncrement;
        }
        break;
      default:
        console.error('unexpected', event, this.scrollTarget);
        break;
      }
    this.updateDOM();
  };
}
////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////
/////////////////////////
////////////
//////
///




function mDown(event) {
  if(event.buttons === 1 || (event.touches && event.touches.length === 1)) {
    event.preventDefault();
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    if(event.target.id === 'block') {
      if(dateRange.currTimeIsSet()) {
        console.error('Last event never finished with last time-block.');
      }
      dateRange.currDay = dateRange.getDay(event.target);
      // Need to create a new time block
      dateRange.setCurrTimeBlock(dateRange.currDay.createNewTime(event));
    } else if (event.target.className === 'time-block'   ||
               event.target.className.includes('handle') ||
               event.target.className === 'time-indicator') {
      if(event.target.parentElement.className === 'block') {
        dateRange.currDay = dateRange.getDay(event.target.parentElement);
      } else if(event.target.parentElement.parentElement.className === 'block') {
        dateRange.currDay = dateRange.getDay(event.target.parentElement.parentElement);
      } else {
        console.error('Could not find current day', event.target);
      }
      // Interacting with an existing time block, specifcally the middle, to pan it.
      dateRange.setCurrTimeBlock(dateRange.currDay.find(event.target));
      if(event.target.className.includes('handle') || event.target.className === 'time-indicator') {
        dateRange.setCurrTimeBlock(dateRange.currDay.find(event.target.parentElement));
      }
      dateRange.currTimeBlock.startInteraction(event);
    }
  }
}

function mUp(event) {
  event.preventDefault();
  if (dateRange.currTimeIsSet()) {
    dateRange.currTimeBlock.endInteraction(event);
    dateRange.getDay(dateRange.currTimeBlock.day).cleanupOverlaps();
    dateRange.clearCurrTimeBlock();

  }
}

function mMove(event) {
  if (dateRange.currTimeIsSet()) {
    if (event.buttons === 1 || (event.touches !== undefined ? event.touches.length === 1 : false)) {
      event.preventDefault();
      dateRange.currTimeBlock.update(event);
    }
  }
}

function scroll(event) {
  if(dateRange.currTimeIsSet()) {
      event.preventDefault();
      dateRange.currTimeBlock.increment(event);
  }
}
