// Offline cache for «صرف سريع بالاسكانر»
const PFX = 'shamsdev-';
const CACHE = PFX + '20261021dev';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// always download fresh copies (never from the browser's HTTP cache) when a new version installs
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PFX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    // the page: try the network first (3 s), fall back to the offline copy
    e.respondWith((async () => {
      const cached = await caches.match('./index.html');
      try {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), cached ? 3000 : 15000);
        const r = await fetch(req, {cache: 'no-store', signal: ctl.signal}); clearTimeout(t);
        if (r && r.ok) return r;
      } catch (x) {}
      return cached || fetch(req);
    })());
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});
