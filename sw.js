const CACHE_NAME = 'tsc-static-v3';
const ASSETS = [
  '/',
  '/TSC/',
  '/TSC/index.html',
  '/TSC/css/base.css',
  '/TSC/css/components.css',
  '/TSC/css/hero.css',
  '/TSC/js/ui.js',
  '/TSC/js/effects.js',
  '/TSC/js/particles.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).catch(() => {})
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
      return res;
    })).catch(() => fetch(req))
  );
});
