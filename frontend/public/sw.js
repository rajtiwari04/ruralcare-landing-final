// RuralCare AI Service Worker v2
const CACHE     = "ruralcare-v2";
const API_CACHE = "ruralcare-api-v1";

const STATIC_ASSETS = ["/", "/offline.html", "/manifest.json"];
const API_ROUTES    = ["/api/patient/health-history", "/api/notifications"];

// Install — cache static assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== API_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener("fetch", e => {
  const { request } = e;
  const url = new URL(request.url);

  // API requests — Network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") return; // Don't cache POST/PUT/DELETE
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok && API_ROUTES.some(r => url.pathname.startsWith(r))) {
          const copy = res.clone();
          caches.open(API_CACHE).then(c => c.put(request, copy));
        }
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets — Cache first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok && res.type !== "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return res;
      }).catch(() => caches.match("/offline.html"));
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", e => {
  if (e.tag === "sync-health-data") {
    e.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const queue = JSON.parse(localStorage.getItem("rc_offline_queue") || "[]");
  if (queue.length === 0) return;
  const token = localStorage.getItem("rc_token");
  if (!token) return;
  try {
    await fetch("/api/sync/queue", { method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+token}, body:JSON.stringify({ actions:queue }) });
    await fetch("/api/sync/process", { method:"POST", headers:{"Authorization":"Bearer "+token} });
    localStorage.removeItem("rc_offline_queue");
    console.log("[SW] Offline data synced");
  } catch(e) { console.warn("[SW] Sync failed, will retry:", e.message); }
}
