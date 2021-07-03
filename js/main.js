//Tick
function tick() {
	var activeID = entries.getIdActive();

	if (activeID) {
		ui.updateTimelineEntry(activeID);
    ui.updateTitleElement(activeID);
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

//Tests

console.log(util.secondsToDuration(0), util.secondsToDuration(0, true));
console.log(util.secondsToDuration(8), util.secondsToDuration(8, true));
console.log(util.secondsToDuration(55), util.secondsToDuration(55, true));
console.log(util.secondsToDuration(60), util.secondsToDuration(60, true));
console.log(util.secondsToDuration(65), util.secondsToDuration(65, true));
console.log(util.secondsToDuration(540), util.secondsToDuration(540, true));
console.log(util.secondsToDuration(600), util.secondsToDuration(600, true));
console.log(util.secondsToDuration(660), util.secondsToDuration(660, true));
console.log(util.secondsToDuration(662), util.secondsToDuration(662, true));
console.log(util.secondsToDuration(662), util.secondsToDuration(662, true));
console.log(util.secondsToDuration(3599), util.secondsToDuration(3599, true));
console.log(util.secondsToDuration(3600), util.secondsToDuration(3600, true));
console.log(util.secondsToDuration(3602), util.secondsToDuration(3602, true));
console.log(util.secondsToDuration(3735), util.secondsToDuration(3735, true));
