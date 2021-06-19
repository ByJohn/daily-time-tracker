//Tick
function tick() {
	var activeID = entries.getIdActive();

	if (activeID) {
		ui.updateTimelineEntry(activeID);
	}
}


//Service workers
function registerServiceWorker() {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js');
  };
}


//Setup
function init() {
  registerServiceWorker();
	entries.init();
	ui.init();
	modal.init();

	entries.load();

	setInterval(tick, 1000);
}

init();
