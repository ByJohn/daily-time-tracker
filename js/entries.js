//Datastore
var entries = {
	entries: {},
  backups: [], //Will hold an array of history entries changes
	indexes: [], //Will hold an ordered list of the enrty times
	days: [], //Will hold a nested array of entry IDs, grouped by day
	names: [], //Will hold all of the unique entry names, most recent first

	init: function () {
		//Any setup here
	},
	getJSONString: function (pretty) {
		var indent = typeof pretty !== 'undefined' ? "\t" : 0;

		return JSON.stringify(this.entries, null, indent);
	},
	setFromJSONString: function (json, save) {
		save = typeof save !== 'undefined' ? save : true;
		var entries = null;

		try {
			entries = JSON.parse(json);
		} catch (error) {
			console.error('JSON string of entries could not be parsed:' , json, error);
		}

		if (typeof entries === 'object' && entries !== null) {
			this.entries = entries;

			this.save();

			this.reindex();

			return true;
		} else {
			console.error('Unable to set from JSON', entries);
		}

		return false;
	},
	load: function () {
		var json = localStorage.getItem('timeTrackerData'); //Get the JSON data from storage

		if (json) {
			return this.setFromJSONString(json, false);
		} else {
			this.reindex(); //Still reindex, in case there are some hard-coded entries
		}

		return false;
	},
	save: function () {
		localStorage.setItem('timeTrackerData', this.getJSONString());
	},
	reindex: function () {
		var that = this;

		//Set up the indexes
		this.indexes = util.sortNumerically(Object.keys(this.entries));
		
		//Set up the days
		this.days = [];
		var lastDate = null;

		this.forEach(function(id, entry) {
			var date = util.secondsToDateObject(id);
			
			if (!lastDate || !util.datesAreOnSameDay(lastDate, date)) {
				that.days.push([]);
			}

			that.days[that.days.length - 1].push(id);

			lastDate = date;
		});

		//Set up the names
		this.names = [];

		this.forEach(function(id, entry) {
			var name = entry.name;

			if (name) {
				var index = that.names.indexOf(name);

				if (index > -1) {
					that.names.splice(index, 1); //Remove the existing instance from the array
				}

				that.names.unshift(name); //Add to start
			}
		});

		document.dispatchEvent(new Event('entries.reindex'));
	},
	getAll: function () {
		return this.entries;
	},
	get: function (id) {
		if (this.entries.hasOwnProperty(id)) {
			return this.entries[id];
		}

		return null;
	},
	getIdBefore: function (id) {
		var index = this.indexes.indexOf(id);

		if (index > -1 && this.indexes[index - 1]) {
			return this.indexes[index - 1];
		}

		return null;
	},
	getIdAfter: function (id) {
		var index = this.indexes.indexOf(id);

		if (index > -1 && this.indexes[index + 1]) {
			return this.indexes[index + 1];
		}

		return null;
	},
	getIdActive: function () {
		var count = this.indexes.length;

		if (count > 0) {
			return this.indexes[count - 1];
		}

		return null;
	},
	getBefore: function (id) {
		return this.get(this.getIdBefore(id));
	},
	getAfter: function (id) {
		return this.get(this.getIdAfter(id));
	},
	getActive: function () {
		return this.get(this.getIdActive());
	},
	forEach: function (callback) {
		this.indexes.forEach(function (id) {
			callback(id, this.get(id));
		}, this);
	},
	getDay: function (day) {
		if (typeof this.days[day] !== 'undefined') {
			return this.days[day];
		}

		return [];
	},
	getLatestDayId: function () {
		if (!this.days.length) return null;

		return this.days.length - 1;
	},
	forEachInDay: function (day, callback) {
		var dayEntries = this.getDay(day);

		dayEntries.forEach(function (id) {
			callback(id, this.get(id));
		}, this);
	},
	getDuration: function (id) {
		var next;

		if (this.getIdActive() == id ) {
			next = Math.round(new Date().getTime()/1000);
		} else {
			next = this.getIdAfter(id);
		}

		if (!next) {
			return null;
		}

		return next - id;
	},
	add: function (name) {
		var id = Math.round(new Date().getTime() / 1000),
			data = {
				name: name,
			};

		this.entries[id] = data;
		this.reindex();
		this.save();
	},
	update: function (id, data) {
		this.entries[id] = data;

		this.save();
		this.reindex();
	},
	changeStart: function (id) {
		//TODO
		this.reindex();
	},
	remove: function (id) {
		//TODO
		this.reindex();
	},
};
