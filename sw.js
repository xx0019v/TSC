const CACHE_NAME = 'tsc-static-v6';
const ASSETS = [
  '/',
  '/TSC/',
  '/TSC/index.html',
  '/TSC/manifest.json',
  '/TSC/css/base.css',
  '/TSC/css/components.css',
  '/TSC/css/hero.css',
  '/TSC/js/ui.js',
  '/TSC/js/effects.js',
  '/TSC/js/particles.js'
];

// Install: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[SW] Install warning:', err);
      });
    }).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k).catch(() => {}))
      );
    }).catch(() => {})
  );
  self.clients.claim();
});

// Fetch: Network-first with cache fallback (optimized strategy)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests that can't be cached
  if (!request.url.startsWith(self.location.origin) && !request.url.includes('googleapis.com') && !request.url.includes('docs.google.com')) {
    return;
  }

  // Strategy: Network-first for HTML, CSS, JS. Cache-first for images.
  const isImage = /\.(jpg?|png|gif|svg|webp)$/i.test(request.url);
  const isDocument = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');

  event.respondWith(
    (isImage ? caches.match(request).then(cached => cached || fetch(request)) : 
     fetch(request)
      .then((res) => {
        if (!res || res.status !== 200 || res.type === 'error') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request) || fetch(request))
    ).catch(() => {
      // Fallback: Return offline page if available
      if (isDocument) return caches.match('/TSC/index.html');
    })
  );
});
