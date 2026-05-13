const CACHE_NAME = 'tm-v2';

const PRECACHE_URLS = [
  './index.html',
  './tacoma-tracker.css',
  './js/data.js',
  './js/storage.js',
  './js/logic.js',
  './js/render.js',
  './js/custom-items.js',
  './js/handlers.js',
  './js/export-pdf.js',
  './js/backup.js',
  './js/bulk-done.js',
  './js/init.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

// ── INSTALL: cache all local assets ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const localCachePromise = cache.addAll(PRECACHE_URLS);

      // Attempt to cache jsPDF — non-fatal if offline during first install
      const jspdfCachePromise = fetch(JSPDF_URL, { mode: 'cors' })
        .then(response => {
          if (response.ok) return cache.put(JSPDF_URL, response);
        })
        .catch(() => {/* offline on first install — PDF export will need Wi-Fi once */});

      return Promise.all([localCachePromise, jspdfCachePromise]);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: delete old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // jsPDF CDN: network-first, fall back to cache
  if (request.url === JSPDF_URL) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Local assets: network-first, fall back to cache for offline
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
