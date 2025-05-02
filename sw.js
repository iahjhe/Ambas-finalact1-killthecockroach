const CACHE_NAME = 'cockroach-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/sw.js',
  '/manifest.json',
  '/assets/images/background.png',
  '/assets/images/cockroach-alive.png',
  '/assets/images/cockroach-dead.png',
  '/assets/sounds/squish.mp3',
  '/assets/sounds/background.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Add this to your fetch event listener
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        // Return cached response if found
        if (response) return response;
        
        // Try network request
        return fetch(e.request)
          .catch(() => {
            // If both cache and network fail, return a fallback
            if (e.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});