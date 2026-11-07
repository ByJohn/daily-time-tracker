import { entries } from './entries.js';
import { modal } from './modal.js';
import { ui } from './ui.js';

export const tick = () => {
	const activeID = entries.getIdActive();

	if (activeID) {
		ui.updateTimelineEntry(activeID);
		ui.updateTitleElement(activeID);
	}
};

export const registerServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('../sw.js').catch((error) => {
			console.warn('Service worker registration failed', error);
		});
	}
};

export const init = () => {
	registerServiceWorker();
	entries.init();
	ui.init();
	modal.init();
	entries.load();
	setInterval(tick, 1000);
};

init();
