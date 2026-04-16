// Service Worker untuk mendukung mode offline
const CACHE_NAME = 'absensi-jurnal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/database.js',
  '/js/utils.js',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache files:', err);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events - Network First, Fallback to Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If request succeeds, clone and store in cache
        const responseClone = response.clone();
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // If it's a navigation request, return the index page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return a fallback response
            return new Response('Offline - Tidak ada koneksi internet', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline data (optional feature)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-absensi') {
    event.waitUntil(syncAbsensi());
  }
});

async function syncAbsensi() {
  // This would sync pending attendance records when back online
  console.log('Syncing attendance data...');
}
