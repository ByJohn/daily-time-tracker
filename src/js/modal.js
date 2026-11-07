import { entries } from './entries.js';
import { ui } from './ui.js';
import { util } from './util.js';

export const modal = {
	$modal: document.getElementById('modal'),
	$background: document.getElementById('modal-background'),
	$close: document.getElementById('modal-close'),
	$pages: document.querySelectorAll('.modal-page'),
	$editForm: document.querySelector('#modal-edit-raw form'),
	$textarea: document.querySelector('.modal [name="json-data"]'),
	$exportOutput: document.getElementById('export-output'),

	init() {
		this.setupEvents();
	},
	setupEvents() {
		ui.$edit.addEventListener('click', () => this.open('edit-raw'), false);
		ui.$export.addEventListener('click', () => this.open('export'), false);
		ui.$connect.addEventListener('click', () => this.open('connect'), false);

		this.$close.addEventListener('click', () => this.close(), false);
		this.$background.addEventListener('click', () => this.close(), false);

		this.$editForm.addEventListener('submit', (event) => this.saveFromTextbox(event), false);
	},
	open(pageID) {
		Array.from(this.$pages).forEach(($page) => {
			$page.classList.remove('active');
		});

		const $newPage = document.getElementById(`modal-${pageID}`);

		if ($newPage) {
			$newPage.classList.add('active');
		}

		this.$modal.classList.add('open');

		switch (pageID) {
			case 'edit-raw':
				this.loadIntoTextbox();
				break;
			case 'export':
				this.displayExport();
				break;
			default:
				break;
		}
	},
	close() {
		this.$modal.classList.remove('open');
	},
	loadIntoTextbox() {
		this.$textarea.value = entries.getJSONString(true);
	},
	saveFromTextbox(event) {
		event.preventDefault();

		const success = entries.setFromJSONString(this.$textarea.value);
		if (success) {
			this.close();
		}
	},
	getExportSummary() {
		const entryTotals = {};
		let total = 0;
		let trackedTotal = 0;
		let untrackedTotal = 0;

		entries.forEachInDay(ui.getDay(), (id, entry) => {
			if (!entry) {
				return;
			}

			const name = typeof entry.name === 'string' ? entry.name.trim() : '';
			const duration = Number(entries.getDuration(id)) || 0;

			if (name) {
				if (!Object.prototype.hasOwnProperty.call(entryTotals, name)) {
					entryTotals[name] = 0;
				}

				entryTotals[name] += duration;
				trackedTotal += duration;
			} else {
				untrackedTotal += duration;
			}

			total += duration;
		});

		const summary = [];
		for (const [name, value] of Object.entries(entryTotals)) {
			summary.push({ name, value });
		}

		summary.push({ name: 'Named Tasks Total', value: trackedTotal });
		summary.push({ name: 'Unnamed Tasks Total', value: untrackedTotal });
		summary.push({ name: 'Total', value: total });

		return summary;
	},
	displayExport() {
		const fragment = document.createDocumentFragment();
		const heading = document.createElement('h3');
		heading.textContent = util.formatDate(ui.getDayDate());
		fragment.appendChild(heading);

		this.getExportSummary().forEach(({ name, value }) => {
			const paragraph = document.createElement('p');
			const label = document.createElement('strong');
			label.textContent = name;
			paragraph.appendChild(label);
			paragraph.appendChild(document.createTextNode(`: ${util.secondsToDuration(value, 0, 2, 2)}`));
			fragment.appendChild(paragraph);
		});

		this.$exportOutput.replaceChildren(fragment);
	},
};
