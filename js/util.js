//Utilities
var util = {
	sortNumerically: function (list) {
		return list.sort(function (a, b) { return a - b; });
	},
	sortNumericallyReverse: function (list) {
		return list.sort(function (a, b) { return b - a; });
	},
  //See https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
  stringToHue: function(string) {
      var hash = 0;

      if (string.length === 0) return hash;

      for (var i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }

      return hash % 360;
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
	secondsToDuration: function (seconds, showSeconds, showMinutes, showHours) {
    var showSeconds = typeof showSeconds !== 'undefined' ? showSeconds : 3;
    var showMinutes = typeof showMinutes !== 'undefined' ? showMinutes : 3;
    var showHours = typeof showHours !== 'undefined' ? showHours : 3;

		var sec_num = parseInt(seconds, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var secondsShowing = showSeconds === 3 || showSeconds === 2 || (showSeconds === 1 && (seconds > 0 || minutes > 0 || hours > 0));
    var minutesShowing = showMinutes === 3 || showMinutes === 2 || (showMinutes === 1 && (minutes > 0 || hours > 0));
    var hoursShowing = showHours === 3 || showHours === 2 || (showHours === 1 && hours > 0);

    if (hours < 10 && showHours === 3) {hours = "0"+hours;}
    if (minutes < 10 && (showMinutes === 3 || hoursShowing )) {minutes = "0"+minutes;}
    if (seconds < 10 && (showSeconds === 3 || hoursShowing || minutesShowing )) {seconds = "0"+seconds;}

    var parts = [];
    if (hoursShowing) parts.push(hours);
    if (minutesShowing) parts.push(minutes);
    if (secondsShowing) parts.push(seconds);

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
