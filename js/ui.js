//UI
var ui = {
  $title: document.querySelector('head title'),
  defaultTitle: '',
	$edit: document.getElementById('edit-raw'),
	$export: document.getElementById('export'),
	$connect: document.getElementById('connect-data'),
	currentDay: null, //Use this.getDay() to access
	$currentDate: document.getElementById('current-date'),
	$prevDay: document.getElementById('prev-day'),
	$nextDay: document.getElementById('next-day'),
	$timeline: document.getElementById('timeline'),
	$addEntry: document.getElementById('add-entry'),
	entryTemplate: document.getElementById('template-timeline-entry').innerHTML.trim(),

	init: function () {
		this.setupEvents();

    this.defaultTitle = this.$title.innerHTML;
	},
	setupEvents: function () {
		this.$prevDay.addEventListener('click', this.previousDay.bind(this), false);
		this.$nextDay.addEventListener('click', this.nextDay.bind(this), false);

		document.addEventListener('entries.reindex', this.updateAddList.bind(this), false);
		document.addEventListener('entries.reindex', this.refreshDay.bind(this), false);

		this.$addEntry.addEventListener('click', this.addEntry.bind(this), false);
	},
	getDay: function () {
		return this.currentDay;
	},
	setDay: function (day) {
		this.currentDay = day;

		this.loadDay();
	},
	previousDay: function () {
		var targetDay = this.getDay() - 1;

		if (entries.getDay(targetDay).length) {
			this.setDay(targetDay);
		}
	},
	nextDay: function () {
		var targetDay = this.getDay() + 1;

		if (entries.getDay(targetDay).length) {
			this.setDay(targetDay);
		}
	},
	refreshDay: function () {
		if (this.getDay() !== null && entries.getDay(this.getDay()).length > 0) {
			this.loadDay();
		} else if (entries.getLatestDayId() !== null) {
			this.setDay(entries.getLatestDayId());
		} else {
			this.setDay(null);
		}
	},
	loadDay: function () {
		this.updateDayDate();
		this.refreshTimeline();

		//If on the latest day
		if (this.getDay() === entries.getLatestDayId()) {
			this.scrollToBottom();
		}
	},
	getDayDate: function () {
		var date = new Date();

		if (this.getDay() !== null) {
			var day = entries.getDay(this.getDay());

			if (day.length) {
				date = util.secondsToDateObject(day[0]);
			}
		}

		return date;
	},
	updateDayDate: function () {
		this.$currentDate.innerHTML = util.formatDate(this.getDayDate());
	},
	scrollToBottom: function () {
		this.$timeline.scrollTop = this.$timeline.scrollHeight;
	},
	refreshTimeline: function () {
		var that = this;

		this.$timeline.innerHTML = ''; //Clear timeline elements

		entries.forEachInDay(this.getDay(), function(id, entry) {
			that.addTimelineEntry(id);
		});
	},
	addTimelineEntry: function (id) {
		var entry = entries.get(id);

		if (!entry) return false;

		var $entry = document.createElement('div'); //Create the entry element

		$entry.classList.add('entry'); //Add a class
		$entry.setAttribute('id', 'entry-' + id); //Give the entry an ID
		$entry.innerHTML = this.entryTemplate; //Add the generic inner content

		if (!entry.name) {
			$entry.classList.add('entry-null');
		}

		if (id === entries.getIdActive()) {
			$entry.classList.add('active');
		}

		this.$timeline.append($entry); //Add the element to the DOM

		var $start = $entry.querySelector('time.start'),
				$name = $entry.querySelector('h3'),
				name = entry.name ? entry.name : '(Untracked)';

		$start.innerHTML = util.secondsToTime(id);
		$name.innerHTML = ''; //Empty the name element
		$name.appendChild(document.createTextNode(name));

		this.updateTimelineEntry(id);
	},
	updateTimelineEntry: function (id) {
		var entry = entries.get(id),
				$entry = document.getElementById('entry-' + id),
				secondsPixelsScale = 0.05; //1 second = 0.05 pixels

		if (!entry || !$entry) return false;

		var duration = entries.getDuration(id),
				$duration = $entry.querySelector('.duration');

		$entry.style.height = (duration * secondsPixelsScale) + 'px';

		$duration.innerHTML = util.secondsToDuration(duration);
	},
	updateAddList: function () {
		var that = this,
			activeEntry = entries.getActive(),
			$buttons = document.querySelectorAll('#add-entry button:not(#new)'); //Select buttons

		//Remove buttons
		if ($buttons.length) {
			$buttons.forEach(function ($button) {
				$button.remove();
			});
		}

		//Add buttons
		entries.names.forEach(function (name) {
				var $button = document.createElement('button');
				$button.appendChild(document.createTextNode(name));
				$button.dataset.name = name;

				if (name == activeEntry.name) {
					$button.classList.add('active');
				}

				that.$addEntry.append($button);
		});
	},
	addEntry: function (e) {
		var name = '';

		if (!e.target || e.target.tagName.toLowerCase() !== 'button') {
			return false;
		}

		if (e.target.id== 'new') {
			name = window.prompt('Start logging time for...', '');

			if (!name || !name.trim()) {
				return false; //Exit
			}
		} else if (typeof e.target.dataset.name !== 'undefined') {
			var entry = entries.getActive();

			if (entry.name == e.target.dataset.name) {
				name = '';
			} else {
				name = e.target.dataset.name;
			}
		}

		entries.add(name.trim());

		this.setDay(entries.getLatestDayId());
	},
  updateTitleElement: function (id) {
		var entry = entries.get(id),
        title = this.defaultTitle;

    if (entry.name) {
      title = entry.name + ' - ' + util.secondsToDuration(entries.getDuration(id));
    }

    this.$title.innerHTML = title;
  },
};
