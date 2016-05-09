class xTimeList {
  constructor(startDate) {
    this.days = [];
    this.startDate = startDate; //This is a String, not a Date object
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

  export(name) {
    let currDay;
    let data = { name, times: [], };
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

        let newData = {start: startTime, end: endTime,};

        data.times.push(newData);
      }
    }
    console.info('Export Finished.');
    return data;
  }

  import(data)
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

  getMinutes(div)
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

// This is a hack to properly export a JS class in meteor
TimeList = xTimeList;
