const CACHE_NAME = "offline cache"
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/offline.html"
]

self.addEventListener("install", event => {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
        )
        self.skipWaiting()
    })

    self.addEventListener("activate", event => {
        event.waitUntil(self.clients.claim())
    })

    self.addEventListener("fetch", event => {
    const req = event.reques

    // Detects page navigations and serves cached content if available
    const isDocument = req.destination === "document" || (req.mode === "navigate")
    if (isDocument) {
        event.respondWith(
            caches
                .match("/index.html")
                .then(resp => resp || caches.match("/offline.html"))
        )

        return
    }

    // If not a page navigation, it always serves cached content
    event.respondWith(
        caches.match(req).then(resp => resp)
    )
})
