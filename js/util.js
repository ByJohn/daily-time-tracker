//Utilities
var util = {
	sortNumerically: function (list) {
		return list.sort(function (a, b) { return a - b; });
	},
	sortNumericallyReverse: function (list) {
		return list.sort(function (a, b) { return b - a; });
	},
	secondsToDateObject: function (seconds) {
		var time = new Date();

		time.setTime(seconds * 1000); //Convert to milliseconds

		return time;
	},
	secondsToTime: function (seconds) {
		var time = util.secondsToDateObject(seconds);

		var hours = time.getHours(),
				minutes = time.getMinutes(),
				suffix = 'am';

		//Cater for 12 hour format
		if (hours > 12) {
			hours -= 12;
			suffix = 'pm';
		}

		//Add leading minute zero
		if (minutes < 10) {
			minutes = '0' + minutes.toString();
		}

		return hours + ':' + minutes + suffix;
	},
	//See https://stackoverflow.com/a/6313008/528423
	secondsToDuration: function (seconds, displayInFull, showSeconds, showMinutes, showHours) {
    var displayInFull = typeof displayInFull !== 'undefined' ? displayInFull : true;
    var showSeconds = typeof showSeconds !== 'undefined' ? showSeconds : 2;
    var showMinutes = typeof showMinutes !== 'undefined' ? showMinutes : 2;
    var showHours = typeof showHours !== 'undefined' ? showHours : 2;

		var sec_num = parseInt(seconds, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10 && showHours !== 0) {hours   = "0"+hours;}
    if (minutes < 10 && (displayInFull || hours > 0 )) {minutes = "0"+minutes;}
    if (seconds < 10 && (displayInFull || hours > 0 || minutes > 0 )) {seconds = "0"+seconds;}

    var parts = [];
    if (showHours === 2 || (showHours === 1 && hours > 0)) parts.push(hours);
    if (showMinutes === 2 || (showMinutes === 1 && (minutes > 0 || hours > 0))) parts.push(minutes);
    if (showSeconds === 2 || (showSeconds === 1 && (seconds > 0 || minutes > 0 || hours > 0))) parts.push(seconds);

    return parts.join(':');
	},
	datesAreOnSameDay: function (first, second) {
    return (
			first.getFullYear() === second.getFullYear() &&
			first.getMonth() === second.getMonth() &&
			first.getDate() === second.getDate()
		);
	},
	formatDate: function (date) {
		var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return weekdays[date.getDay()] + ' ' + date.toLocaleDateString('en-GB');
	},
};
