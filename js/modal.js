//Modal
var modal = {
	$modal: document.getElementById('modal'),
	$background: document.getElementById('modal-background'),
	$close: document.getElementById('modal-close'),
	$pages: document.querySelectorAll('.modal-page'),
	$editForm: document.querySelector('#modal-edit-raw form'),
	$textarea: document.querySelector('.modal [name="json-data"]'),
	$exportOutput: document.getElementById('export-output'),

	init: function () {
		this.setupEvents();
	},
	setupEvents: function () {
		ui.$edit.addEventListener('click', this.open.bind(this, 'edit-raw'), false);
		ui.$export.addEventListener('click', this.open.bind(this, 'export'), false);
		ui.$connect.addEventListener('click', this.open.bind(this, 'connect'), false);

		this.$close.addEventListener('click', this.close.bind(this), false);
		this.$background.addEventListener('click', this.close.bind(this), false);

		this.$editForm.addEventListener('submit', this.saveFromTextbox.bind(this), false);
	},
	open: function (pageID) {
		[].forEach.call(this.$pages, function($page) {
			$page.classList.remove('active');
		});

		var $newPage = document.getElementById('modal-' + pageID);

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
		}
	},
	close: function () {
		this.$modal.classList.remove('open');
	},
	loadIntoTextbox: function () {
		this.$textarea.value = entries.getJSONString(true);
	},
	saveFromTextbox: function (e) {
		e.preventDefault();

		var success = entries.setFromJSONString(this.$textarea.value);

		if (success) this.close();
	},
	displayExport: function () {
		var text = '',
				entryTotals = {},
        total = 0,
        trackedTotal = 0;

		text += '<h3>' + util.formatDate(ui.getDayDate()) + '</h3>';

		entries.forEachInDay(ui.getDay(), function(id, entry) {
			var name = entry.name !== '' ? entry.name : 'Untracked',
          duration = entries.getDuration(id);

			if (!entryTotals.hasOwnProperty(name)) {w
				entryTotals[name] = 0;
			}

			entryTotals[name] += duration;
      total += duration;

      if (entry.name) trackedTotal += duration;
		});

    entryTotals['Tracked Total'] = trackedTotal;
    entryTotals['Total'] = total;

		for (var name in entryTotals) {
			text += '<p><strong>' + name + '</strong>: ' + util.secondsToDuration(entryTotals[name]) + '</p>';
		}

		this.$exportOutput.innerHTML = text;
	},
};
