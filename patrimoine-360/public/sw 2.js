/// Service Worker — Patrimoine 360°
/// Stratégie : cache-first pour les assets statiques, network-first pour les API

const CACHE_NAME = "p360-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
];

// Installation : pré-cache des assets essentiels
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : stratégie hybride
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== "GET") return;

  // API : network-first (pas de cache)
  if (url.pathname.startsWith("/api/")) return;

  // Assets statiques (_next/static) : cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages : stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Hors-ligne : retourner le cache ou une page de secours
          if (cached) return cached;
          if (request.destination === "document") {
            return caches.match("/");
          }
          return new Response("Hors-ligne", { status: 503 });
        });

      return cached || fetched;
    })
  );
});
