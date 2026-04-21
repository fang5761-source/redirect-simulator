const CACHE_NAME = 'redirect-v1-network-first';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sunmoon_logo.jpg'
];

// 1. 安裝階段：強制新版引擎立刻接管
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

// 2. 啟動階段：清空舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
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
  self.clients.claim(); 
});

// 3. 攔截要求階段 (網路優先 Network-First)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response; 
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});