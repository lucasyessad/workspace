// ============================================================
// TabibPro — Service Worker (PWA Offline-First)
// Mode hors ligne complet — Critique pour l'Algérie
// Zones à connectivité limitée (Sud, zones rurales)
// ============================================================

const CACHE_VERSION = 'tabibpro-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const MEDICAL_DATA_CACHE = `${CACHE_VERSION}-medical`;

// ---- Ressources à cacher au départ ----
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

// ---- Routes API disponibles offline (depuis cache) ----
const OFFLINE_API_ROUTES = [
  '/api/v1/patients',
  '/api/v1/consultations',
  '/api/v1/ordonnances',
  '/api/v1/stock',
  '/api/v1/rdv',
  '/api/v1/ref/wilayas',
  '/api/v1/pharmacopee',
];

// ---- Routes API JAMAIS offline (nécessitent connexion) ----
const ONLINE_ONLY_ROUTES = [
  '/api/v1/ai/',         // IA médicale
  '/api/v1/sync/',       // Synchronisation
];

// ============================================================
// Installation
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installation — TabibPro Offline Mode');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ============================================================
// Activation — Nettoyage des anciens caches
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('medgest-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== MEDICAL_DATA_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ============================================================
// Fetch — Stratégie par type de ressource
// ============================================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // IA : ne jamais mettre en cache, afficher message offline si pas de réseau
  if (ONLINE_ONLY_ROUTES.some((r) => url.pathname.startsWith(r))) {
    event.respondWith(fetchOnlineOnly(event.request));
    return;
  }

  // Données médicales (API) : cache-first avec mise à jour en arrière-plan
  if (OFFLINE_API_ROUTES.some((r) => url.pathname.startsWith(r))) {
    event.respondWith(staleWhileRevalidate(event.request, MEDICAL_DATA_CACHE));
    return;
  }

  // Ressources statiques : cache-first
  if (url.origin === self.location.origin && event.request.method === 'GET') {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Autres : network-first
  event.respondWith(networkFirst(event.request));
});

// ============================================================
// Stratégies de cache
// ============================================================

/**
 * Cache-First : Tenter le cache, sinon réseau.
 * Pour les ressources statiques (images, CSS, JS).
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Ressource non disponible hors ligne', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

/**
 * Network-First : Tenter le réseau, sinon cache.
 * Pour les données dynamiques.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

/**
 * Stale-While-Revalidate : Retourner le cache immédiatement,
 * mettre à jour en arrière-plan.
 * Pour les données médicales (patients, consultations).
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Mise à jour en arrière-plan si en ligne
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || offlineFallback(request);
}

/**
 * Online-Only : Retourner une réponse offline si pas de réseau.
 * Pour l'IA médicale.
 */
async function fetchOnlineOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "L'IA médicale est indisponible en mode hors ligne. Reconnectez-vous pour utiliser l'assistant IA.",
        code: 'AI_OFFLINE',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

/**
 * Page de fallback hors ligne.
 */
async function offlineFallback(request) {
  if (request.headers.get('accept')?.includes('text/html')) {
    const cached = await caches.match('/offline');
    if (cached) return cached;
  }

  return new Response(
    JSON.stringify({
      success: false,
      message: 'Hors ligne — Les données seront synchronisées à la reconnexion.',
      code: 'OFFLINE',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  );
}

// ============================================================
// Background Sync — Envoi différé des modifications
// ============================================================
self.addEventListener('sync', (event) => {
  console.log(`[SW] Background Sync: ${event.tag}`);

  if (event.tag === 'sync-medical-data') {
    event.waitUntil(syncMedicalData());
  }

  if (event.tag === 'send-pending-messages') {
    event.waitUntil(sendPendingMessages());
  }
});

async function syncMedicalData() {
  console.log('[SW] Synchronisation des données médicales...');
  // Notifier les clients que la sync est en cours
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_STARTED', data: { timestamp: Date.now() } });
  });
}

async function sendPendingMessages() {
  console.log('[SW] Envoi des messages en attente...');
}

// ============================================================
// Push Notifications
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.data,
      actions: data.actions || [],
      tag: data.tag || 'medgest-notification',
      requireInteraction: data.requireInteraction || false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/dashboard')
  );
});

// ============================================================
// Messages depuis l'app principale
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CACHE_PATIENTS') {
    // Pré-cacher les données patients pour le mode offline
    event.waitUntil(
      caches.open(MEDICAL_DATA_CACHE).then((cache) => {
        return cache.put(
          '/api/v1/patients?offline=true',
          new Response(JSON.stringify(event.data.patients), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      })
    );
  }
});
