/* exported ui */
/* global entries, util */
const ui = {
	$title: document.querySelector('head title'),
	defaultTitle: '',
	$edit: document.getElementById('edit-raw'),
	$export: document.getElementById('export'),
	$connect: document.getElementById('connect-data'),
	$undo: document.getElementById('undo'),
	currentDay: null,
	$currentDate: document.getElementById('current-date'),
	$prevDay: document.getElementById('prev-day'),
	$nextDay: document.getElementById('next-day'),
	$timeline: document.getElementById('timeline'),
	$addEntry: document.getElementById('add-entry'),
	entryTemplate: document.getElementById('template-timeline-entry').innerHTML.trim(),

	init: function () {
		this.setupEvents();
		this.defaultTitle = this.$title.textContent || '';
	},
	setupEvents: function () {
		this.$undo.addEventListener('click', () => this.undo(), false);
		this.$prevDay.addEventListener('click', () => this.previousDay(), false);
		this.$nextDay.addEventListener('click', () => this.nextDay(), false);

		document.addEventListener(
			'entries.reindex',
			() => {
				this.updateUndoButton();
				this.updateAddList();
				this.refreshDay();
			},
			false
		);

		this.$addEntry.addEventListener('click', (event) => this.addEntry(event), false);
		this.$timeline.addEventListener('click', (event) => this.maybeEntryActionClicked(event), false);
	},
	updateUndoButton: function () {
		this.$undo.toggleAttribute('disabled', !entries.hasBackup());
	},
	undo: function () {
		entries.restoreBackup();
	},
	getDay: function () {
		return this.currentDay;
	},
	setDay: function (day) {
		this.currentDay = day;
		this.loadDay();
	},
	previousDay: function () {
		const targetDay = this.getDay() - 1;

		if (entries.getDay(targetDay).length) {
			this.setDay(targetDay);
		}
	},
	nextDay: function () {
		const targetDay = this.getDay() + 1;

		if (entries.getDay(targetDay).length) {
			this.setDay(targetDay);
		}
	},
	refreshDay: function () {
		const day = this.getDay();

		if (day !== null && entries.getDay(day).length > 0) {
			this.loadDay();
			return;
		}

		const latestDayId = entries.getLatestDayId();

		if (latestDayId !== null) {
			this.setDay(latestDayId);
			return;
		}

		this.setDay(null);
	},
	loadDay: function () {
		this.updateDayDate();
		this.refreshTimeline();

		if (this.getDay() === entries.getLatestDayId()) {
			this.scrollToBottom();
		}
	},
	getDayDate: function () {
		let date = new Date();
		const day = this.getDay();

		if (day !== null) {
			const entriesForDay = entries.getDay(day);

			if (entriesForDay.length) {
				date = util.secondsToDateObject(entriesForDay[0]);
			}
		}

		return date;
	},
	updateDayDate: function () {
		this.$currentDate.textContent = util.formatDate(this.getDayDate());
	},
	scrollToBottom: function () {
		this.$timeline.scrollTop = this.$timeline.scrollHeight;
	},
	refreshTimeline: function () {
		this.$timeline.innerHTML = '';

		entries.forEachInDay(this.getDay(), (id) => {
			this.addTimelineEntry(id);
		});
	},
	addTimelineEntry: function (id) {
		const entry = entries.get(id);

		if (!entry) {
			return false;
		}

		const $entry = document.createElement('div');
		$entry.classList.add('entry');
		$entry.setAttribute('id', `entry-${id}`);
		$entry.setAttribute('data-id', id);
		$entry.innerHTML = this.entryTemplate;

		if (!entry.name) {
			$entry.classList.add('entry-null');
		} else {
			$entry.style.backgroundColor = `hsl(${util.stringToHue(entry.name)}, 100%, 99%)`;
		}

		if (id === entries.getIdActive()) {
			$entry.classList.add('active');
		}

		this.$timeline.append($entry);

		const $start = $entry.querySelector('time.start');
		const $name = $entry.querySelector('h3');
		const name = entry.name ? entry.name : '(Unnamed Task)';

		$start.textContent = util.secondsToTime(id);
		$name.textContent = '';
		$name.appendChild(document.createTextNode(name));

		this.updateTimelineEntry(id);
		return true;
	},
	updateTimelineEntry: function (id) {
		const entry = entries.get(id);
		const $entry = document.getElementById(`entry-${id}`);
		const secondsPixelsScale = 0.05;

		if (!entry || !$entry) {
			return false;
		}

		const duration = entries.getDuration(id);
		const $duration = $entry.querySelector('.duration');

		$entry.style.height = `${duration * secondsPixelsScale}px`;
		$duration.textContent = util.secondsToDuration(duration);
		return true;
	},
	updateAddList: function () {
		const activeEntry = entries.getActive();
		const $buttons = document.querySelectorAll('#add-entry button:not(#new)');

		$buttons.forEach(($button) => {
			$button.remove();
		});

		entries.names.forEach((name) => {
			const $button = document.createElement('button');
			$button.appendChild(document.createTextNode(name));
			$button.dataset.name = name;
			$button.style.backgroundColor = `hsl(${util.stringToHue(name)}, 100%, 99%)`;

			if (activeEntry && activeEntry.name === name) {
				$button.classList.add('active');
			}

			this.$addEntry.append($button);
		});

		this.$addEntry.scrollTo(0, 0);
	},
	addEntry: function (event) {
		let name = '';
		const target = event.target;

		if (!target || target.tagName.toLowerCase() !== 'button') {
			return false;
		}

		if (target.id === 'new') {
			name = window.prompt('Start logging time for...', '');

			if (!name || !name.trim()) {
				return false;
			}
		} else if (typeof target.dataset.name !== 'undefined') {
			const entry = entries.getActive();

			if (entry && entry.name === target.dataset.name) {
				name = '';
			} else {
				name = target.dataset.name;
			}
		}

		entries.add(name.trim());
		this.setDay(entries.getLatestDayId());
		return true;
	},
	updateTitleElement: function (id) {
		const entry = entries.get(id);
		let title = this.defaultTitle;

		if (entry && entry.name) {
			title = `${util.secondsToDuration(entries.getDuration(id), 1, 1, 1)} - ${entry.name}`;
		}

		this.$title.textContent = title;
	},
	maybeEntryActionClicked: function (event) {
		const target = event.target;

		if (!target || target.tagName.toLowerCase() !== 'button' || typeof target.dataset.entryAction === 'undefined') {
			return;
		}

		const entryId = target.closest('.entry') && target.closest('.entry').dataset.id;
		this.processEntryAction(target.dataset.entryAction, entryId);
	},
	processEntryAction: function (action, id) {
		const entry = entries.get(id);

		if (!entry) {
			return;
		}

		const actionParts = action.split(':');

		switch (actionParts[0]) {
			case 'start':
				this.editEntryStart(id, actionParts[1]);
				break;
			case 'rename': {
				const newName = window.prompt('Set new name', entry.name);
				const trimmedName = newName !== null ? newName.trim() : null;

				if (newName !== null && trimmedName !== entry.name) {
					const entryData = {};
					entryData[id] = { name: trimmedName };
					entries.update(entryData);
				}
				break;
			}
			case 'merge':
				this.mergeEntry(id, actionParts[1]);
				break;
			case 'swap-time':
				this.swapEntryDuration(id, actionParts[1]);
				break;
			case 'swap-name':
				this.swapEntryName(id, actionParts[1]);
				break;
			default:
				break;
		}
	},
	editEntryStart: function (id, action) {
		id = Number.parseInt(id, 10);

		let text = `${action} start`;
		let value = 1;
		const prevId = entries.getIdBefore(id);
		const nextId = entries.getIdAfter(id);
		let min = -Infinity;
		let max = Infinity;

		if (action === 'decrease') {
			min = 1;

			if (prevId !== null) {
				max = id - Number.parseInt(prevId, 10) - 1;
			}
		} else if (action === 'edit') {
			value = id;

			if (prevId !== null) {
				min = Number.parseInt(prevId, 10) + 1;
			}

			if (nextId !== null) {
				max = Number.parseInt(nextId, 10) - 1;
			} else {
				max = Math.round(new Date().getTime() / 1000);
			}
		} else if (action === 'increase') {
			min = 1;
			max = Math.round(new Date().getTime() / 1000) - id - 1;

			if (nextId !== null) {
				max = Number.parseInt(nextId, 10) - id - 1;
			}
		}

		if (min > max) {
			min = max;
		}

		text += ` (${min} - ${max})`;
		text = text.replace(/Infinity/g, '∞');

		const newValue = window.prompt(text, value);

		if (newValue === null || String(newValue).trim() === '' || (action === 'edit' && Number(newValue) === value)) {
			return;
		}

		if (Number.isNaN(Number(newValue))) {
			alert(`Error: "${newValue}" is invalid.`);
			return;
		}

		const parsedValue = Number.parseInt(newValue, 10);

		if (parsedValue < min || parsedValue > max) {
			alert(`Error: ${parsedValue} is not between ${min} - ${max}.`);
			return;
		}

		let newId = parsedValue;

		if (action === 'decrease') {
			newId = id - parsedValue;
		} else if (action === 'increase') {
			newId = id + parsedValue;
		}

		entries.updateId(id, newId);
	},
	mergeEntry: function (id, direction) {
		const entry = entries.get(id);
		const otherId = direction === 'prev' ? entries.getIdBefore(id) : entries.getIdAfter(id);
		const otherEntry = entries.get(otherId);

		if (!entry || !otherEntry) {
			return;
		}

		const entryData = {};

		if (direction === 'prev') {
			entryData[id] = null;
			entryData[otherId] = { name: entry.name };
		} else {
			entryData[otherId] = null;
		}

		entries.update(entryData);
	},
	swapEntryDuration: function (id, direction) {
		const entry = entries.get(id);
		const otherId = direction === 'prev' ? entries.getIdBefore(id) : entries.getIdAfter(id);
		const otherEntry = entries.get(otherId);

		if (!entry || !otherEntry || entry.name === otherEntry.name) {
			return;
		}

		let id1;
		let id2;
		let entry2;

		if (direction === 'prev') {
			id1 = otherId;
			id2 = id;
			entry2 = entry;
		} else {
			id1 = id;
			id2 = otherId;
			entry2 = otherEntry;
		}

		const entryData = {};
		const newId2 = Number.parseInt(id1, 10) + Number.parseInt(entries.getDuration(id2), 10);

		entryData[id2] = null;
		entryData[newId2] = { name: entry2.name };

		entries.update(entryData);
	},
	swapEntryName: function (id, direction) {
		const entry = entries.get(id);
		const otherId = direction === 'prev' ? entries.getIdBefore(id) : entries.getIdAfter(id);
		const otherEntry = entries.get(otherId);

		if (!entry || !otherEntry || entry.name === otherEntry.name) {
			return;
		}

		const entryData = {};
		entryData[id] = { name: otherEntry.name };
		entryData[otherId] = { name: entry.name };

		entries.update(entryData);
	},
};
