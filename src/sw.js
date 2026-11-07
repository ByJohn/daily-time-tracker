const cacheName = 'daily-time-tracker-cache';
const filesToCache = [
	'/',
	'/index.html',
	'/css/normalize.min.css',
	'/css/style.css',
	'/js/entries.js',
	'/js/main.js',
	'/js/modal.js',
	'/js/ui.js',
	'/js/util.js',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(filesToCache))
			.catch((error) => {
				console.warn('Unable to cache app shell', error);
			})
	);
});

self.addEventListener('fetch', (event) => {
	const relativePath = event.request.url.replace(self.location.origin, '');

	if (filesToCache.includes(relativePath)) {
		event.respondWith(fromCache(event.request));
		event.waitUntil(update(event.request).then(refresh));
		return;
	}

	event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

function fromCache(request) {
	return caches.open(cacheName).then((cache) => cache.match(request));
}

function update(request) {
	return caches.open(cacheName).then(async (cache) => {
		const response = await fetch(request);
		if (response.ok) {
			await cache.put(request, response.clone());
		}
		return response;
	});
}

function refresh(response) {
	return self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			const message = {
				type: 'refresh',
				url: response.url,
				eTag: response.headers.get('ETag'),
			};

			client.postMessage(JSON.stringify(message));
		});
	});
}
