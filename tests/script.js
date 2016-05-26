
const day = document.getElementById("block");
const dayObj = new Day(day);
let currTimeBlock = null;

window.addEventListener('mousedown', mDown, false);
window.addEventListener('mousemove', mMove, false);
window.addEventListener('mouseup', mUp, false);
window.addEventListener('touchstart', mDown, false);
window.addEventListener('touchmove', mMove, false);
window.addEventListener('touchend', mUp, false);


function DateRange(startDate) {
  this.days = [];
  this.startDate = startDate;

  this.add = function(dayIndex, timeBlock) {
    if(this.days[dayIndex] === undefined) {
      this.days[dayIndex] = new Day(dayIndex);
    }
    this.days[dayIndex].add(timeBlock);
  };

  this.remove = function(dayIndex, timeBlock) {
    let timeIndex = this.days[dayIndex].indexOf(timeBlock);
    if(timeIndex === -1) {
      return false;
    }
    this.days[dayIndex].splice(timeIndex, 1);
  };

  this.getDay = function(dayIndex) {
    return this.days[dayIndex];
  };

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

  this.getMinutes = function(div)
  {
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

function Day(index) {
  this.times = [];
  this.dayIndex = index;

  // Methods
  this.add = function(block) {
    this.times.push(block);
  };

  this.delete = function(block) {
    block.element.remove();	// Delete HTML element from DOM
    return this.times.splice(this.times.indexOf(block), 1);
  };

  this.find = function(element) {
    for (let i of this.times) {
      if(i.element === element) {
        return i;
      }
    }
    return null;
  };

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

function Block(day, event, minWidth) {
  let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
  let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
  // Properties
  this.day = day;
  this.startX = clientX - day.offsetLeft - 20;
  this.lastX = this.startX ;
  this.lastY = clientY
  this.dx = 0;
  this.left = this.startX;
  this.width = 40;
  this.minWidth = minWidth || 0;
  this.element = document.createElement('div');
  this.element.className = 'time-block';
  this.element.style.left = this.left + 'px';
  this.day.appendChild(this.element);
  this.pan = false;	// Used for modifying the time block.
  this.cursorOffset = 0;
  this.startY = 0;
  this.screenY = 0;
  this.targetY = 0;
  this.resetting = false;
  this.deleting = false;

  this.leftHandle = document.createElement('div');
  this.leftHandle.className = 'handle left';
  this.rightHandle = document.createElement('div');
  this.rightHandle.className = 'handle right';
  this.element.appendChild(this.leftHandle);
  this.element.appendChild(this.rightHandle);

  // Constants
  this.fineMovementY = this.day.offsetTop + this.day.offsetHeight + 200;

  // Methods
  this.update = function(event) {
    if(this.resetting) { return; }

    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;

    let newX = clientX;
    if(newX < this.day.offsetLeft) {
      newX = this.day.offsetLeft;
    }

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

      if (this.left < 0) {
        this.left = 0;
        // This handles the issue where dragging the handle off the edge would make the width grow
        //this.width += newX - this.day.offsetLeft - this.cursorOffset;
      }
      if (this.left > this.day.offsetWidth-this.minWidth) {
        this.left = this.day.offsetWidth-this.minWidth;
      }
      if (this.width + this.left > this.day.offsetWidth) {
        this.width = this.day.offsetWidth-this.left;
      }
    }
    this.updateDOM();
  };

  this.panBlock = function() {

    this.left = this.startX + this.dx - this.cursorOffset;
    if(this.left < 0) {this.left = 0;}
    if(this.left+this.width > this.day.offsetWidth) { this.left = this.day.offsetWidth - this.width;}
  };

  this.expandLeftBlock = function() {
    let newLeft, newWidth; // new left and width
    newLeft = this.dx + this.startX - this.cursorOffset;
    newWidth = Math.abs(this.dx) + this.cursorOffset;
    // So it can not go before the start of the day
    if(newLeft < 0) {
      newLeft = 0;
      newWidth += this.lastX - this.day.offsetLeft - this.cursorOffset;
    }
    // Only update if the left handle stays on left side
    if(this.startX - newLeft >= 2*this.leftHandle.offsetWidth) {
      this.left = newLeft;
      this.width = newWidth;
    } else {
      this.left = this.startX - 2*this.leftHandle.offsetWidth;
      this.width = 2*this.leftHandle.offsetWidth;
    }
  };

  this.expandRightBlock = function() {
    let newWidth;
    newWidth = this.dx - this.cursorOffset;

    // So it can not go past the day
    if(newWidth > this.day.offsetWidth-this.left) {
      newWidth = this.day.offsetWidth-this.left;
    }
    // Handles when the right handle tries to overlap the left one
    if(newWidth >= 2*this.rightHandle.offsetWidth) {
      this.width = newWidth;
    } else {
      this.width = 2*this.rightHandle.offsetWidth;
    }
  };

  this.updateDOM = function() {
    this.element.style.left = (this.left/this.day.offsetWidth)*100 + '%';
    this.element.style.width = (this.width/this.day.offsetWidth)*100 + '%';
  };

  this.startInteraction = function(event) {
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
    if(event.target.className === 'time-block') {
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

  this.endInteraction = function(event) {
    this.pan = false;
    this.cursorOffset = 0;
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
  };

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
        dayObj.delete(this);
      }
      this.resetting = false;
    }
  };

}





function mDown(event) {
  if(event.buttons === 1 || (event.touches && event.touches.length === 1)) {
    event.preventDefault();
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    if(event.target.id === 'block') {
      if(currTimeBlock !== null) {
        console.error('Last event never finished with last time-block.');
      }
      // Need to create a new time block
      currTimeBlock = new Block(day, event);
      dayObj.add(currTimeBlock);
    } else if (event.target.className === 'time-block' || event.target.className.includes('handle')) {
      // Interacting with an existing time block, specifcally the middle, to pan it.
      currTimeBlock = dayObj.find(event.target);
      if(event.target.className.includes('handle')) {
        currTimeBlock = dayObj.find(event.target.parentElement);
      }
      currTimeBlock.startInteraction(event);
    }
  }
}

function mUp(event) {
  event.preventDefault();
  if (currTimeBlock !== null) {
    currTimeBlock.endInteraction(event);
    currTimeBlock = null;

    dayObj.cleanupOverlaps();
  }
}

function mMove(event) {
  if (currTimeBlock !== null) {
    if (event.buttons === 1 || (event.touches !== undefined ? event.touches.length === 1 : false)) {
      event.preventDefault();
      currTimeBlock.update(event);
    }
  }
}
