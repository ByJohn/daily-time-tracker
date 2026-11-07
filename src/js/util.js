/* exported util */
const HUE_MAX = 360;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;

const util = {
	sortNumerically: function (list) {
		return [...list].sort((a, b) => a - b);
	},
	sortNumericallyReverse: function (list) {
		return [...list].sort((a, b) => b - a);
	},
	// See https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
	stringToHue: function (string = '') {
		let hash = 0;

		if (string.length === 0) {
			return hash;
		}

		for (let index = 0; index < string.length; index += 1) {
			hash = string.charCodeAt(index) + ((hash << 5) - hash);
			hash |= 0;
		}

		return Math.abs(hash) % HUE_MAX;
	},
	secondsToDateObject: function (seconds) {
		const time = new Date();
		time.setTime(Number(seconds) * MILLISECONDS_PER_SECOND);
		return time;
	},
	secondsToTime: function (seconds) {
		const time = util.secondsToDateObject(seconds);
		let hours = time.getHours();
		const minutes = time.getMinutes();
		let suffix = 'am';

		if (hours >= 12) {
			suffix = 'pm';
			hours = hours % 12 || 12;
		} else {
			hours = hours || 12;
		}

		const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `${hours}:${paddedMinutes}${suffix}`;
	},
	// See https://stackoverflow.com/a/6313008/528423
	secondsToDuration: function (seconds, showSeconds = 3, showMinutes = 3, showHours = 3) {
		const totalSeconds = Number.parseInt(seconds, 10) || 0;
		const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
		const minutes = Math.floor((totalSeconds - hours * SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
		const remainingSeconds = totalSeconds - hours * SECONDS_PER_HOUR - minutes * SECONDS_PER_MINUTE;

		const secondsShowing =
			showSeconds === 3 ||
			showSeconds === 2 ||
			(showSeconds === 1 && (remainingSeconds > 0 || minutes > 0 || hours > 0));
		const minutesShowing = showMinutes === 3 || showMinutes === 2 || (showMinutes === 1 && (minutes > 0 || hours > 0));
		const hoursShowing = showHours === 3 || showHours === 2 || (showHours === 1 && hours > 0);

		let displayHours = hours;
		let displayMinutes = minutes;
		let displaySeconds = remainingSeconds;

		if (displayHours < 10 && showHours === 3) {
			displayHours = `0${displayHours}`;
		}

		if (displayMinutes < 10 && (showMinutes === 3 || hoursShowing)) {
			displayMinutes = `0${displayMinutes}`;
		}

		if (displaySeconds < 10 && (showSeconds === 3 || hoursShowing || minutesShowing)) {
			displaySeconds = `0${displaySeconds}`;
		}

		const parts = [];
		if (hoursShowing) {
			parts.push(displayHours);
		}
		if (minutesShowing) {
			parts.push(displayMinutes);
		}
		if (secondsShowing) {
			parts.push(displaySeconds);
		}

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
		const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return `${weekdays[date.getDay()]} ${date.toLocaleDateString('en-GB')}`;
	},
};
