// Service Worker for トクノリレンタカー
const CACHE_NAME = 'tokunori-v1';
const STATIC_ASSETS = [
  '/rent/',
  '/rent/index.html',
  '/rent/reserve.html',
  '/rent/login.html',
  '/rent/terms.html',
  '/rent/privacy.html',
  '/rent/404.html',
  '/rent/css/style.css',
  '/rent/js/common.js',
  '/rent/js/config.js',
  '/rent/images/logo.svg',
  '/rent/images/logo-icon.png',
  '/rent/manifest.json'
];

// インストール時に静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// フェッチ時のキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // APIリクエストはネットワークファースト
  if (url.pathname.startsWith('/v1/') || url.hostname.includes('run.app')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // オフライン時はエラーレスポンスを返す
          return new Response(
            JSON.stringify({ error: 'オフラインです。ネットワーク接続を確認してください。' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // 静的アセットはキャッシュファースト
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // バックグラウンドでキャッシュを更新
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        // 成功したレスポンスをキャッシュ
        if (response.ok && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // オフラインでHTMLを要求された場合は404ページを表示
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/rent/404.html');
        }
      });
    })
  );
});
