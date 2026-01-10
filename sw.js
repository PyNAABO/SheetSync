const CACHE_NAME = "sheetsync-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon.png",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap",
  "https://cdn.jsdelivr.net/npm/chart.js",
];

// Install Event - Cache Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event - Network First for API, Cache First for Assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If it's the Google Script API, always go to network (we handle offline logic in app.js)
  if (url.hostname.includes("script.google.com")) {
    return;
  }

  // For everything else (HTML, CSS, Icons), serve from cache if available
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
