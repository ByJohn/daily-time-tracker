var cacheName = 'daily-time-tracker-cache',
    filesToCache = [
      '/',
      '/index.html',
      '/css/style.css',
      '/js/entries.js',
      '/js/main.js',
      '/js/modal.js',
      '/js/ui.js',
      '/js/util.js',
    ];

// Start the service worker and cache all of the app's content
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

//Serve cached content when offline
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );

  
});
