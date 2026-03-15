const CACHE_NAME = 'adcat-cache-v5';
const ASSETS = [
  './',
  './index.html',
  './index.css',
  './js/app.js',
  './js/data.js',
  './js/ui.js',
  './icon.png',
  './manifest.json'
];

// Install event - Cache assets and skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event - Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediately take control of all open pages
  );
});

// Fetch event - Network first for HTML, Cache first for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Strategy: Network First for HTML files to ensure updates
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/AdCat/') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Strategy: Cache First for assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
