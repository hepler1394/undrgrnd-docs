const CACHE_NAME = 'undrgrnd-docs-v3';
const SHELL_ASSETS = [
    '/',
    '/index.html',
    'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500..800&family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS).catch((err) => {
                console.log('SW: Cache asset warning:', err);
            });
        })
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
            }).catch(() => caches.match(event.request))
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
