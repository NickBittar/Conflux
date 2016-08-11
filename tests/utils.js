function treatAsUTC(date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    startDate = new Date(startDate.getFullYear() + '-' + startDate.getMonth() + '-' + startDate.getDate());
    endDate = new Date(endDate.getFullYear() + '-' + endDate.getMonth() + '-' + endDate.getDate());
    let millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}
