// Kill-switch service worker.
// The old static site registered a caching SW (tsc-static-v8). The site is now
// a single-file React build with no SW. This worker replaces the old one:
// it clears all caches, unregisters itself, and reloads open tabs so returning
// visitors never get a stale/404 page.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((c) => c.navigate(c.url));
      } catch (e) {
        // ignore
      }
    })()
  );
});

// Always go to network; never serve stale cache.
self.addEventListener("fetch", () => {});
