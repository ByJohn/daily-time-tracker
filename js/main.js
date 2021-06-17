//Tick
function tick() {
	var activeID = entries.getIdActive();

	if (activeID) {
		ui.updateTimelineEntry(activeID);
	}
}


//Setup
function init() {
	entries.init();
	ui.init();
	modal.init();

	entries.load();

	setInterval(tick, 1000);
}

init();
