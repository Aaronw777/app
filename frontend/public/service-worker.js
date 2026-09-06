/**
 * Court Mastery service worker.
 * Strategy:
 *   • Precache app-shell (icons, manifest) on install.
 *   • Runtime: network-first for /api/* (so data is fresh); cache-first for
 *     everything else (HTML/JS/CSS) with a network fallback.
 *   • Never cache POST/PATCH/DELETE.
 */
const CACHE = "court-mastery-v3";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // API calls: network-first, fall back to cache if offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // App shell / static: cache-first, then network
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((resp) => {
            if (resp && resp.ok && resp.type === "basic") {
              const clone = resp.clone();
              caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return resp;
          })
          .catch(() => caches.match("/"))
    )
  );
});
