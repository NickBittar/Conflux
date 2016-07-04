const dateRange = {
  startDate: new Date('2016-07-01'),
  endDate: new Date(),
  startTime: 0,
  endTime: 24,
};
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
