self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('crickpredict-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/pwa-192x192.png',
        '/pwa-512x512.png',
        '/apple-touch-icon.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('crickpredict-'))
          .filter((cacheName) => cacheName !== 'crickpredict-v1')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open('crickpredict-v1').then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});