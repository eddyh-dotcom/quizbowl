// Caches the app shell only. Questions come from qbreader.org and always need
// the network — bump CACHE_NAME whenever index.html changes, or phones will
// keep serving the old copy.
const CACHE_NAME = 'quizbowl-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache API calls — a cached tossup you've already seen is worse than an error.
  if (url.hostname.endsWith('qbreader.org')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
