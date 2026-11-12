/* Alpha-O service worker: app shell works offline; chat/API requests are never cached. */
const VERSION = "alpha-o-v4";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "favicon.png", "components/sidebar.html", "components/chat.html", "components/settings.html", "components/dialogs.html", "components/app-updates.html", "components/voice-mode.html", "components/robot-3d.html", "components/read-aloud.html", "components/automate.html", "components/startup.html", "components/chat-extras.html", "components/voice-extras.html", "components/voice-plus.html"];
const CDN = ["https://cdnjs.cloudflare.com/"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))));
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  if (req.url.indexOf("_chk=") > -1) return; // update checks always go to the network
  const url = new URL(req.url), same = url.origin === location.origin, cdn = CDN.some(p => req.url.startsWith(p));
  if (!same && !cdn) return; // the AI backend and analytics always go straight to the network
  if (req.mode === "navigate"){
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html") || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")){ const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
