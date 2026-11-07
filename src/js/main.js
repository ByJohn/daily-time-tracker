const tick = () => {
	const activeID = entries.getIdActive();

	if (activeID) {
		ui.updateTimelineEntry(activeID);
		ui.updateTitleElement(activeID);
	}
};

const registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('../sw.js').catch((error) => {
			console.warn('Service worker registration failed', error);
		});
	}
};

const init = () => {
	registerServiceWorker();
	entries.init();
	ui.init();
	modal.init();
	entries.load();
	setInterval(tick, 1000);
};

init();
