const cacheName = "v3";

const cacheAssets = [
  "index.html",
  "restaurant.html",
  "/css/styles.css",
  "/css/responsive.css",
  "/js/main.js",
  "/js/restaurant_info.js",
  "/js/dbhelper.js"
];

// Call install event

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(cacheAssets);
    })
  );
});

// Call Activate Event

self.addEventListener("activate", event => {
  // Remove unwanted caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cache => cache !== cacheName)
          .map(cacheNamesToDelete => caches.delete(cacheNamesToDelete))
      );
    })
  );
});

// Call Fetch Event
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Make Copy/Clone
        const resClone = res.clone();
        caches.open(cacheName).then(cache => {
          // Add Response To Cache
          cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(err => caches.match(event.request).then(res => res))
  );
});
