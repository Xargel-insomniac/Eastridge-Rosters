// Eastridge Roster service worker: keeps the app's own files on the phone so it opens instantly and
// still shows the last-loaded roster without Wi-Fi. Roster data itself is cached by Firestore, not here.
const VERSION = "2026-10-30-6";
const CACHE = "eastridge-" + VERSION;
const CORE = [
  "/", "/firebase-config.js", "/manifest.webmanifest",
  "/assets/eastridge-logo.png", "/assets/hospital.webp", "/assets/hospital-900.webp",
  "/assets/icon-192.png", "/assets/favicon.png",
];
const CDN = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/)/;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("eastridge-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 5000))]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? cache.match("/") : Response.error());
  }
}
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
  return res;
}
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const fresh = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || fresh;
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // The page and its settings always come fresh when online, so updates show up straight away.
    if (req.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html") || url.pathname === "/firebase-config.js") event.respondWith(networkFirst(req));
    else event.respondWith(staleWhileRevalidate(req));
  } else if (CDN.test(req.url)) {
    event.respondWith(cacheFirst(req)); // versioned library and font files never change
  }
  // Everything else (Firebase sign-in and database traffic) goes straight to the network.
});
