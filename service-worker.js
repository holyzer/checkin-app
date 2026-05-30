// service-worker.js - 离线缓存支持
const CACHE_NAME = 'checkin-app-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-512.svg'
];

// 安装：缓存核心资源，立即激活（skipWaiting 让新 SW 马上接管）
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活：删除所有旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch 策略：网络优先，失败降级到缓存（确保永远拿到最新版本）
self.addEventListener('fetch', event => {
  // 只处理同源请求，忽略 JSONP 等外部请求
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 网络成功：更新缓存，返回最新版本
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // 网络失败：从缓存读（离线时用）
        return caches.match(event.request);
      })
  );
});
