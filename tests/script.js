document.getElementById('fab').addEventListener('click', toggleModal, false);
document.getElementById('submit').addEventListener('click', submit, false);
document.getElementById('modal-close').addEventListener('click', toggleModal, false);
document.getElementById('modal-overlay').addEventListener('click', toggleModal, false);

var modal = document.getElementById('modal-wrapper');
var modalWindow = document.getElementById('modal');
function toggleModal(event) {
  if(!document.getElementById('modal-content').innerText.includes('Submitting...')) {
    if(modal.className.includes('modal-hide')) {
      showModal();
    } else {
      hideModal();
    }
  }
}
function showModal() {
  modal.className = modal.className.replace('hide', 'show');
  modalWindow.className = modalWindow.className.replace('up', 'down');
}
function hideModal() {
  modal.className = modal.className.replace('show', 'hide');
  modalWindow.className = modalWindow.className.replace('down', 'up');
}
function submit() {
  let name = document.getElementById('name').value.trim();
  if(!name) { return false; }

  // success
  //Lock modal
  let exportData = dateRange.export(1, name);
  //exportData = JSON.stringify(exportData);
  dateRange.import(exportData);
  document.getElementsByClassName('modal-content')[0].innerHTML = '<h2>Submitting...</h2>';
  setTimeout(function() {
    document.getElementsByClassName('modal-content')[0].innerHTML = '<h2>Submitted!</h2>';
    // disable timeblock interactions
    removeEventListeners();
    document.getElementById('fab').remove();
    // Disable manipulations of time-blocks
    document.querySelectorAll('.time-block').forEach(function(tb) {
      tb.className += ' disable';
    });
  }, 2000);
}




const day = document.getElementById("block");
//const dayObj = new Day(day);
const dateRange = new DateRange(new Date('2016-07-03'), new Date(), 0, 24);

init();
function init() {
  let container = document.querySelector('.container');
  let startDate = new Date(dateRange.startDate.getTime());
  const days = document.querySelectorAll('.block');
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  let i = 0;
  while(startDate.getTime() <= dateRange.endDate.getTime()) {
    let day = document.createElement('div');
    day.className = 'day';
    let div = document.createElement('div');
    div.className = 'block';
    div.id = 'block';
    let dayDate = document.createElement('div');
    dayDate.className = 'day-date';
    dayDate.innerText = startDate.toString().split('00')[0]; // quick hack to get a nice date
    day.appendChild(dayDate);
    day.appendChild(div);
    container.appendChild(day);
    dateRange.days.push(new Day(i++, startDate, div, dateRange.startTime, dateRange.endTime));
    // make tick marks
    let ticks = document.createElement('div');
    ticks.className = 'time-marks';
    for(let j = dateRange.startTime; j <= dateRange.endTime; j++) {

      let span = document.createElement('span');
      span.className = 'time-mark';
      let hour = j;
      if(hour > 12) {
        hour -= 12;
      }
      if(hour === 0) {
        hour = 12;
      }
      span.innerText = hour;
      if(j === 12) {
        span.innerHTML += '<br>PM';
      } else if(hour%12===0) {
        span.innerHTML += '<br>AM';
      }
      // Each hour should have at least 24 pixels of width
      if(document.body.offsetWidth < (dateRange.endTime - dateRange.startTime)*24) {
        let k = j-dateRange.startTime;
        if(j != dateRange.startTime && j != dateRange.endTime) {
          if(k%2 === 1) {
            span.innerHTML = '';
          }
        }
      }
      ticks.appendChild(span);
    }
    day.appendChild(ticks);

    startDate.setDate(startDate.getDate()+1);
  }
  // Add event listeners for each day to collapse/expand
  const daysList = document.querySelectorAll('.day-date');
  for(let i = 0; i < daysList.length; i++) {
    daysList[i].addEventListener('click', function(){toggleDay(event.target);}, false);
  }
}

/* EVENT LISTENERS */

addEventListeners();
function addEventListeners() {
  window.addEventListener('mousedown', mDown, false);
  window.addEventListener('mousemove', mMove, false);
  window.addEventListener('mouseup', mUp, false);
  window.addEventListener('touchstart', mDown, false);
  window.addEventListener('touchmove', mMove, false);
  window.addEventListener('touchend', mUp, false);

  window.addEventListener('wheel', scroll, false);
}
function removeEventListeners() {
  window.removeEventListener('mousedown', mDown, false);
  window.removeEventListener('mousemove', mMove, false);
  window.removeEventListener('mouseup', mUp, false);
  window.removeEventListener('touchstart', mDown, false);
  window.removeEventListener('touchmove', mMove, false);
  window.removeEventListener('touchend', mUp, false);

  window.removeEventListener('wheel', scroll, false);
}

function mDown(event) {
  if(event.buttons === 1 || (event.touches && event.touches.length === 1)) {

    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    if(event.target.id === 'block') {
      event.preventDefault();
      if(dateRange.currTimeIsSet()) {
        console.error('Last event never finished with last time-block.');
      }
      dateRange.currDay = dateRange.getDay(event.target);
      // Need to create a new time block
      dateRange.setCurrTimeBlock(dateRange.currDay.createNewTime(event));
    } else if (event.target.className.includes('time-block')   ||
               event.target.className.includes('handle')       ||
               event.target.className.includes('time-indicator')) {
      event.preventDefault();
      if(event.target.parentElement.className === 'block') {
        dateRange.currDay = dateRange.getDay(event.target.parentElement);
      } else if(event.target.parentElement.parentElement.className === 'block') {
        dateRange.currDay = dateRange.getDay(event.target.parentElement.parentElement);
      } else {
        console.error('Could not find current day', event.target);
      }
      // Interacting with an existing time block, specifcally the middle, to pan it.
      dateRange.setCurrTimeBlock(dateRange.currDay.find(event.target));
      if(event.target.className.includes('handle') || event.target.className.includes('time-indicator')) {
        dateRange.setCurrTimeBlock(dateRange.currDay.find(event.target.parentElement));
      }
      dateRange.currTimeBlock.startInteraction(event);
    }
  }
}

function toggleDay(target) {
  let dayCard = target.parentElement;
  if(dayCard.style.maxHeight !== '64px') {
    target.style.zIndex = 5;
    dayCard.style.maxHeight = '64px';
    dayCard.style.overflowY = 'hidden';
  } else {
    target.style.zIndex = 1;
    dayCard.style.maxHeight = '356px';
    // To make sure the transistion is over so no time-blocks stick out from the top
    setTimeout(function(){
      // Make sure it wasn't toggled again to hide it
      if(dayCard.style.maxHeight === '356px')
        dayCard.style.overflowY = 'visible';
    }, 300);
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
  if(modal.className.includes('show')) {
    event.preventDefault();
  }

}
