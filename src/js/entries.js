import { util } from './util.js';

export const entries = {
	entries: {},
	backups: [],
	indexes: [],
	days: [],
	names: [],

	init() {
		// Any setup here
	},
	getJSONString(pretty) {
		const indent = typeof pretty !== 'undefined' ? '\t' : 0;
		return JSON.stringify(this.entries, null, indent);
	},
	setFromJSONString(json, save = true) {
		let parsedEntries = null;

		try {
			parsedEntries = JSON.parse(json);
		} catch (error) {
			console.error('JSON string of entries could not be parsed:', json, error);
		}

		if (typeof parsedEntries === 'object' && parsedEntries !== null) {
			this.entries = parsedEntries;

			if (save) {
				this.save();
			}

			this.reindex();
			return true;
		}

		console.error('Unable to set from JSON', parsedEntries);
		return false;
	},
	load() {
		const json = localStorage.getItem('timeTrackerData');

		if (json) {
			return this.setFromJSONString(json, false);
		}

		this.reindex();
		return false;
	},
	save() {
		localStorage.setItem('timeTrackerData', this.getJSONString());
	},
	reindex() {
		const self = this;

		this.indexes = util.sortNumerically(Object.keys(this.entries).map((id) => Number.parseInt(id, 10)));

		this.days = [];
		let lastDate = null;

		this.forEach((id) => {
			const date = util.secondsToDateObject(id);

			if (!lastDate || !util.datesAreOnSameDay(lastDate, date)) {
				self.days.push([]);
			}

			self.days[self.days.length - 1].push(id);
			lastDate = date;
		});

		this.names = [];

		this.forEach((id) => {
			const entry = this.get(id);
			const name = entry && entry.name ? entry.name : null;

			if (!name) {
				return;
			}

			const index = self.names.indexOf(name);

			if (index > -1) {
				self.names.splice(index, 1);
			}

			self.names.unshift(name);
		});

		document.dispatchEvent(new Event('entries.reindex'));
	},
	hasBackup() {
		return this.backups.length > 0;
	},
	saveBackup(storedEntries) {
		this.backups.push(Object.assign({}, storedEntries));

		const limit = 5;

		if (this.backups.length > limit) {
			this.backups.splice(0, this.backups.length - limit);
		}
	},
	getRestore() {
		return this.backups.pop();
	},
	restoreBackup() {
		const restore = this.getRestore();

		if (typeof restore === 'undefined') {
			return false;
		}

		this.entries = restore;
		this.save();
		this.reindex();
		return true;
	},
	getAll() {
		return this.entries;
	},
	get(id) {
		if (Object.prototype.hasOwnProperty.call(this.entries, id)) {
			return this.entries[id];
		}

		return null;
	},
	getIdBefore(id) {
		const index = this.indexes.indexOf(Number.parseInt(id, 10));

		if (index > -1 && typeof this.indexes[index - 1] !== 'undefined') {
			return this.indexes[index - 1];
		}

		return null;
	},
	getIdAfter(id) {
		const index = this.indexes.indexOf(Number.parseInt(id, 10));

		if (index > -1 && typeof this.indexes[index + 1] !== 'undefined') {
			return this.indexes[index + 1];
		}

		return null;
	},
	getIdActive() {
		const count = this.indexes.length;

		if (count > 0) {
			return this.indexes[count - 1];
		}

		return null;
	},
	getBefore(id) {
		return this.get(this.getIdBefore(id));
	},
	getAfter(id) {
		return this.get(this.getIdAfter(id));
	},
	getActive() {
		return this.get(this.getIdActive());
	},
	forEach(callback) {
		this.indexes.forEach((id) => {
			callback(id, this.get(id));
		});
	},
	getDay(day) {
		if (typeof this.days[day] !== 'undefined') {
			return this.days[day];
		}

		return [];
	},
	getLatestDayId() {
		if (!this.days.length) {
			return null;
		}

		return this.days.length - 1;
	},
	forEachInDay(day, callback) {
		const dayEntries = this.getDay(day);

		dayEntries.forEach((id) => {
			callback(id, this.get(id));
		});
	},
	getDuration(id) {
		let next;

		if (this.getIdActive() === id) {
			next = Math.round(new Date().getTime() / 1000);
		} else {
			next = this.getIdAfter(id);
		}

		if (!next) {
			return null;
		}

		return next - id;
	},
	add(name) {
		this.saveBackup(this.entries);

		const id = Math.round(new Date().getTime() / 1000);
		const data = {
			name,
		};

		this.entries[id] = data;
		this.reindex();
		this.save();
	},
	update(entryData) {
		if (!entryData || typeof entryData !== 'object') {
			return false;
		}

		this.saveBackup(this.entries);

		for (const id in entryData) {
			if (Object.prototype.hasOwnProperty.call(entryData, id)) {
				if (entryData[id] === null) {
					delete this.entries[id];
				} else {
					this.entries[id] = entryData[id];
				}
			}
		}

		this.save();
		this.reindex();
		return true;
	},
	updateId(oldId, newId) {
		if (!Number.isInteger(oldId) || !Number.isInteger(newId) || oldId === newId) {
			return;
		}

		this.saveBackup(this.entries);

		const updatedEntries = {};
		let addedNewEntry = false;
		const self = this;

		this.forEach((id) => {
			if (id > newId) {
				updatedEntries[newId] = self.entries[oldId];
				addedNewEntry = true;
			}

			if (id !== oldId) {
				updatedEntries[id] = self.entries[id];
			}
		});

		if (!addedNewEntry) {
			updatedEntries[newId] = this.entries[oldId];
		}

		if (newId < oldId) {
			delete updatedEntries[oldId];
		}

		this.entries = updatedEntries;
		this.save();
		this.reindex();
	},
};
