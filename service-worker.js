// service-worker.js - 离线缓存支持
const CACHE_NAME = 'checkin-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
