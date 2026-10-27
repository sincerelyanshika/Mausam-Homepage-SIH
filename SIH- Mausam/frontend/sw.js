const CACHE_NAME = "mausam-v2";
const urlsToCache = ["/", "/css/style.css", "/js/app.js", "/js/voice.js"];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match("/");
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});