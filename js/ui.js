//UI
var ui = {
  $title: document.querySelector('head title'),
  defaultTitle: '',
	$edit: document.getElementById('edit-raw'),
	$export: document.getElementById('export'),
	$connect: document.getElementById('connect-data'),
	$undo: document.getElementById('undo'),
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
    var that = this;

		this.$undo.addEventListener('click', this.undo.bind(this), false);

		this.$prevDay.addEventListener('click', this.previousDay.bind(this), false);
		this.$nextDay.addEventListener('click', this.nextDay.bind(this), false);

    document.addEventListener('entries.reindex', this.updateUndoButton.bind(this), false);
		document.addEventListener('entries.reindex', this.updateAddList.bind(this), false);
		document.addEventListener('entries.reindex', this.refreshDay.bind(this), false);

		this.$addEntry.addEventListener('click', this.addEntry.bind(this), false);

		this.$timeline.addEventListener('click', this.maybeEntryActionClicked.bind(this), false);
	},
  updateUndoButton: function() {
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
		$entry.setAttribute('data-id', id); //Give the entry a data ID
		$entry.innerHTML = this.entryTemplate; //Add the generic inner content

		if (!entry.name) {
			$entry.classList.add('entry-null');
		} else {
      $entry.style.backgroundColor = 'hsl(' + util.stringToHue(entry.name) + ', 100%, 99%';
    }

		if (id === entries.getIdActive()) {
			$entry.classList.add('active');
		}

		this.$timeline.append($entry); //Add the element to the DOM

		var $start = $entry.querySelector('time.start'),
				$name = $entry.querySelector('h3'),
				name = entry.name ? entry.name : '(Unnamed Task)';

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
      $button.style.backgroundColor = 'hsl(' + util.stringToHue(name) + ', 100%, 99%';

      if (name == activeEntry.name) {
        $button.classList.add('active');
      }

      that.$addEntry.append($button);
		});

    this.$addEntry.scrollTo(0, 0); //Scroll to the top of the add-entry list
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
  maybeEntryActionClicked: function (e) {
    if (!e.target || e.target.tagName.toLowerCase() !== 'button' || typeof e.target.dataset.entryAction === 'undefined') return;

    this.processEntryAction( e.target.dataset.entryAction, e.target.closest('.entry').dataset.id );
  },
  processEntryAction: function (action, id) {
		var entry = entries.get(id);
    
    if ( ! entry ) return;

    action = action.split(':');

    switch ( action[0] ) {
      case 'start' :
        this.editEntryStart(id, action[1]);
        break;

      case 'rename' :
			  var newName = window.prompt('Set new name', entry.name);

        if (newName !== null && newName != entry.name) {
          var newEntry = {
            name: newName,
          };

          entries.update(id, newEntry);
        }

        break;
    }
  },
  editEntryStart: function (id, action) {
    id = parseInt(id);

    var text = action + ' start',
        value = 1,
        prevId = entries.getIdBefore(id),
        nextId = entries.getIdAfter(id),
        min = -Infinity,
        max = Infinity;

    if (action == 'decrease') {
      min = 1;

      if (prevId !== null) {
        max = id - parseInt(prevId) - 1;
      }
    } else if (action == 'edit') {
      value = id;

      if (prevId !== null) {
        min = parseInt(prevId) + 1;
      }

      if (nextId !== null) {
        max = parseInt(nextId) - 1;
      } else {
        max = Math.round(new Date().getTime() / 1000);
      }
    } else if (action == 'increase') {
      min = 1;
      max = Math.round(new Date().getTime() / 1000) - id - 1;

      if (nextId !== null) {
        max = parseInt(nextId) - id - 1;
      }
    }

    if (min > max) {
      min = max;
    }
    
    text += ' (' + min + ' - ' + max + ')';
    text = text.replace(/Infinity/g, '∞');

    var newValue = window.prompt(text, value);

    if (newValue === null || newValue.trim() === '' || (action == 'edit' && newValue == value)) return;
    
    if (isNaN(newValue)) {
      alert('Error: "' + newValue + '" is invalid.');
      return;
    }

    newValue = parseInt(newValue);

    if (newValue < min || newValue > max) {
      alert('Error: ' + newValue + ' is not between ' + min + ' - ' + max + '.');
      return;
    }

    var newId = newValue;

    if (action == 'decrease') {
      newId = id - newValue;
    } else if (action == 'increase') {
      newId = id + newValue;
    }

    entries.updateId(id, newId);
  },
  updateTitleElement: function (id) {
		var entry = entries.get(id),
        title = this.defaultTitle;

    if (entry.name) {
      title = util.secondsToDuration(entries.getDuration(id), 1, 1, 1) + ' - ' + entry.name;
    }

    this.$title.innerHTML = title;
  },
};
