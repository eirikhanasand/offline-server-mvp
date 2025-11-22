# Offline Website MVP

On a random train trip, I suddenly wondered whether it is possible to cache a website completely, to avoid the `You are not connected to the internet` / `The site can not be loaded because the computer is not connected to the internet` error page. To my surprise, it is actually possible using service workers (eventListeners). 

I wanted to quickly create a MVP, so I conducted my favorite LLM (I hate them all). Of course it didnt work at first, and I started doubting the entire project. So, as any sensible person would do, I decided to research it on my own. I then discovered [this]() StackOverflow thread from many years ago, which explained that it has been possible since 2009 using service workers. Furthermore, it explains that it is only possible using a secure connection, meaning the site had to be served over HTTPS.

Still doubting whether this would work, I asked said LLM to update the page to use a certificate. The result is the current repository. To run the code, generate a certificate and start the server using the following commands.

## How to start the server
Note that the MVP only works on a MVP connection that is not localhost. For localhost it will always work, since the file is coming from the same computer. I recommend using a phone or other device and then using the network IP to test it on your phone. if youre running this on a HTTPS endpoint and dont need a new certificate skip to step 3 (if youre not sure start with step 1).

1. Start the server using `npx serve .` to find the Network IP:
```
UPDATE  The latest version of `serve` is 14.2.5

   ┌──────────────────────────────────────────┐
   │                                          │
   │   Serving!                               │
   │                                          │
   │   - Local:    http://localhost:3000      │
   │   - Network:  http://192.168.64.1:3000   │
   │                                          │
   │   Copied local address to clipboard!     │
   │                                          │
   └──────────────────────────────────────────┘
```

For example here, the network IP is `172.20.10.2`. Make sure the phone and computer is on the same device. If youre testing with no wifi at all, you will likely get a IP starting with 192 like the above example. That means the computer has no network at all, and the MVP will not work, since it is not being served from a different device. If you only need the site on the same device, you can skip the worker altogether and just browse the files directly. In that case, this project is not for you. 

2. Generate the certificate using `mkcert 172.20.10.2`. Make sure to run it in the same folder as the MVP.

3. Start the server using the following command. This starts the server on port 3000 on the identified local network IP, and uses the created certificate to serve over HTTPS.
http-server . \
  -S \
  -C 172.20.10.2.pem \
  -K 172.20.10.2-key.pem \
  -p 3000 \
  -a 172.20.10.2

4. The server is now available at `https://172.20.10.2:3000`

## Files
### index.html
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Offline MVP</title>
    </head>
    <body>
        <h1>Page cached!</h1>
        <p>If you navigate to a page that doesnt exist, it will fallback to `offline.html`.</p>

        <script>
            if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/worker.js");
            }
        </script>
    </body>
</html>
```

### offline.html
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Offline</title>
    </head>
    <body>
        <h1>Offline Mode</h1>
        <p>You are offline, but the site still works.</p>
    </body>
</html>
```

### worker.js
```ts
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
```
