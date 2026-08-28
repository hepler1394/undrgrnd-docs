const CACHE_NAME = 'undrgrnd-docs-v5';
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/og-v2.jpg'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => Promise.allSettled(
            SHELL_ASSETS.map((asset) => cache.add(asset))
        ))
    );
    self.skipWaiting();
});

// Activate: Clean up old cache storage
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first for documents (so deploys reach returning visitors),
// cache-first for other same-origin assets.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const isDocument = event.request.mode === 'navigate' ||
        event.request.destination === 'document' ||
        new URL(event.request.url).pathname === '/index.html';

    if (isDocument) {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return response;
            }).catch(async () => (
                await caches.match(event.request)
                || await caches.match('/index.html')
                || Response.error()
            ))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return response;
            });
        })
    );
});
