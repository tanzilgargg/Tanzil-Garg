/* CYCORA offline support (only active when the game is served over http/https).
   First visit: the whole game is cached so it works offline.
   After that: files load instantly from the cache and are quietly refreshed in the
   background, so an update you upload reaches players on their next visit.
   No version number to remember to change. */
const CACHE = 'cycora-v1';
const FILES = [
"./",
"css/base.css",
"css/features.css",
"css/hq.css",
"css/play.css",
"css/screens.css",
"fonts/dm-mono-latin-400-normal.woff2",
"fonts/dm-mono-latin-500-normal.woff2",
"fonts/fonts.css",
"fonts/fredoka-latin-500-normal.woff2",
"fonts/fredoka-latin-600-normal.woff2",
"fonts/fredoka-latin-700-normal.woff2",
"fonts/nunito-latin-500-normal.woff2",
"fonts/nunito-latin-600-normal.woff2",
"fonts/nunito-latin-700-normal.woff2",
"fonts/nunito-latin-800-normal.woff2",
"icons/icon-180.png",
"icons/icon-192.png",
"icons/icon-512.png",
"index.html",
"js/app.js",
"js/art/characters.js",
"js/art/scenes.js",
"js/core/audio.js",
"js/core/fx.js",
"js/core/store.js",
"js/core/util.js",
"js/data/meta.js",
"js/data/worlds.js",
"js/engine/keyboard.js",
"js/engine/typing.js",
"js/game/lesson.js",
"js/game/play.js",
"js/screens/about.js",
"js/screens/hq.js",
"js/screens/licence.js",
"js/screens/misc.js",
"js/screens/planet.js",
"js/screens/race.js",
"js/screens/world.js",
"js/systems/planet.js",
"js/systems/progress.js",
"manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('cycora-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then((cache) => cache.match(req, { ignoreSearch: true }).then((cached) => {
    const fresh = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached || cache.match('./index.html'));
    return cached || fresh;
  })));
});
