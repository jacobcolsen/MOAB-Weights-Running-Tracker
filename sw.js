'use strict';

// Increment this version string whenever app.js, styles.css, or index.html change.
// The old cache will be deleted automatically on the next SW activation.
const CACHE_NAME = 'moab-v1';

// App shell — must all be cached for offline to work
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
];

// Optional assets — cached best-effort (missing files won't break install)
const EXTRAS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
];

// ── Install: pre-cache the app shell ──────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(SHELL).then(() =>
        // Icons are optional — silently skip any that 404
        Promise.allSettled(EXTRAS.map(url => cache.add(url)))
      )
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: delete stale caches ─────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, network fallback ──────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Only intercept same-origin requests
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        // Only cache valid, non-opaque responses
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => {
        // Network failed — serve index.html for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
