// Service Worker for トクノリレンタカー
// キャッシュバージョン: 更新時はここを変更
const CACHE_NAME = 'tokunori-v2';
const STATIC_ASSETS = [
  // HTMLファイルはキャッシュしない（常に最新を取得）
  '/rent/images/logo.svg',
  '/rent/images/logo-icon.png',
  '/rent/images/logo-text.png',
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
  
  // HTMLファイルはネットワークファースト（常に最新を取得）
  if (event.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // JSファイルもネットワークファースト
  if (url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // 画像などの静的アセットはキャッシュファースト
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
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
      });
    })
  );
});
