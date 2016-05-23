const doc = document,
day = doc.getElementById("block");
const debug = {
  div: document.getElementById("debug"),
  write: function(line) {
    this.div.innerHTML += "<br>" + line;
  },
  u: function(ele, val) {
    document.getElementById(ele).textContent = val;
  }
};

function DateRange(element) {
  this.days = [];
  this.element = element;
}

function Day(element) {
  this.times = [];
  this.element = element;

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
  }
  this.overlap = function(div1, div2)
  {
    let success = false;
    const rect1 = div1.element.getBoundingClientRect();
    const rect2 = div2.element.getBoundingClientRect();
    if(!(rect1.right < rect2.left || rect1.left > rect2.right ))	// If there is an overlap
    {
      if(rect2.right < rect1.right && rect2.left > rect1.left)	// div1 contains div2
      {
        this.delete(div2);
        success = true;
      }
      else if(rect1.right < rect2.right && rect1.left > rect2.left)	// div2 contains div1
      {
        this.delete(div1);
        success = true;
      }
      else if(rect1.left < rect2.left)	// div2 overlaps div1 on div1's right side
      {
        div1.width = rect2.width + rect2.left - rect1.left;
        div1.updateDOM();
        this.delete(div2);
        success = true;
      }
      else if(rect1.left > rect2.left) // div1 overlaps div2 on div2's right side
      {
        div2.width = rect1.width + rect1.left - rect2.left;
        div2.updateDOM();
        this.delete(div1);
        success = true;
      }
      else if(rect1.left === rect2.left)
      {
        if(rect1.width >= rect2.width) {
          this.delete(div2);
        }
        else {
          this.delete(div1);
        }
        success = true;
      }
    }
    return success;
  }


}

function Block(day, startX, minWidth) {
  // Properties
  this.day = day;
  this.startX = startX - day.offsetLeft - 20;
  this.lastX = this.startX ;
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
  this.targetY = 200;
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
      this.element.style.transform = `translateY(${this.screenY}px)`;
      const normalizedDragDistance = Math.abs(this.screenY / this.element.offsetHeight);
      const opacity = 1 - Math.pow(normalizedDragDistance, 3);
      if(this.screenY > this.element.offsetHeight*0.35) {
        opacity -= 0.1
      }
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

  this.resetYPos = function() {
    console.log(this.screenY);
    if(!(Math.abs(this.screenY) < this.targetY + 0.1 && Math.abs(this.screenY) > this.targetY - 0.1)) {
      this.resetting = true;
      this.screenY = (this.screenY - this.targetY) / 2;
      this.element.style.transform = `translateY(${this.screenY}px)`;
      const normalizedDragDistance = Math.abs(this.screenY / this.element.offsetHeight);
      const opacity = 1 - Math.pow(normalizedDragDistance, 3);
      this.element.style.opacity = opacity;
      let that = this;
      setTimeout(that.resetYPos.bind(this), 32);
      //setTimeout(this.resetYPos, 1000);
    } else {
      if(this.resetting && this.targetY > 0) {
        dayObj.delete(this);
      }
      this.resetting = false;


    }
  };
}

const dayObj = new Day(day);
let currTimeBlock = null;

window.addEventListener('mousedown', mDown, false);
window.addEventListener('mousemove', mMove, false);
window.addEventListener('mouseup', mUp, false);
window.addEventListener('touchstart', mDown, false);
window.addEventListener('touchmove', mMove, false);
window.addEventListener('touchend', mUp, false);

function mDown(event) {
  if(event.buttons === 1 || (event.touches && event.touches.length === 1)) {
    event.preventDefault();
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
    if(event.target.id === 'block') {
      if(currTimeBlock !== null) {
        console.error('Last event never finished with last time-block.');
      }
      // Need to create a new time block
      currTimeBlock = new Block(day, clientX);
      dayObj.add(currTimeBlock);
    } else if (event.target.className === 'time-block') {
      // Interacting with an existing time block, specifcally the middle, to pan it.
      currTimeBlock = dayObj.find(event.target);
      currTimeBlock.pan = true;
      currTimeBlock.cursorOffset = clientX - currTimeBlock.left - currTimeBlock.day.offsetLeft;
      currTimeBlock.startY = clientY;
    } else if (event.target.className.includes('handle')) {
      // Modifying one of the sides of a time block
      currTimeBlock = dayObj.find(event.target.parentElement);
      if (event.target.className.includes('left')) {
        currTimeBlock.cursorOffset = clientX - currTimeBlock.left - currTimeBlock.day.offsetLeft;
        currTimeBlock.startX = currTimeBlock.left+currTimeBlock.width;
        currTimeBlock.expandLeft = true;
        currTimeBlock.expandRight = false;
      } else {
        currTimeBlock.cursorOffset = clientX - (currTimeBlock.left+currTimeBlock.width) - currTimeBlock.day.offsetLeft;
        currTimeBlock.startX = currTimeBlock.left;
        currTimeBlock.expandLeft = false;
        currTimeBlock.expandRight = true;
      }
    }
    if(currTimeBlock != null) {
      currTimeBlock.element.style.zIndex = 1;
    }
  }
}

function mUp(event) {
  event.preventDefault();
  if (currTimeBlock !== null) {
    currTimeBlock.pan = false;
    currTimeBlock.cursorOffset = 0;
    currTimeBlock.element.style.zIndex = 0;
    if( currTimeBlock.startY - event.clientY > currTimeBlock.element.offsetHeight * 0.35) {
      currTimeBlock.targetY = 200;
      currTimeBlock.deleting = true;
    } else {
      currTimeBlock.targetY = 0;
      currTimeBlock.deleting = false;
    }
    currTimeBlock.resetYPos();
    currTimeBlock = null;

    dayObj.cleanupOverlaps();
  }
}

function mMove(event) {
  if (currTimeBlock !== null) {
    if (event.buttons === 1 || event.touches.length === 1) {
      event.preventDefault();
      currTimeBlock.update(event);
    }
  }
}



function Time(event) {
  console.log(event);
  debug.u('cursor', event.offsetX + ', ' + event.offsetY);
  debug.u('target', event.target.className);
}

function create(event) {
  debug.u('cursor', event.offsetX + ', ' + event.offsetY);
  debug.u('target', event.target.className);
  const div = document.createElement("div");
  div.className = "time-block";
  div.addEventListener("click", Time, false);
  event.target.appendChild(div);
}
