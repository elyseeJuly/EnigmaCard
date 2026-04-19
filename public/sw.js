const CACHE_NAME = "enigma-card-local-v2";
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg"];

async function collectAppAssets() {
  const assets = new Set(CORE_ASSETS);

  try {
    const response = await fetch("/index.html", { cache: "no-cache" });
    const html = await response.text();
    const matches = html.matchAll(/(?:src|href)="([^"]+)"/g);
    for (const match of matches) {
      const assetPath = match[1];
      if (!assetPath.startsWith("/") || assetPath.startsWith("//")) {
        continue;
      }
      assets.add(assetPath);
    }
  } catch {
    // Keep the minimal shell when asset discovery is unavailable.
  }

  return [...assets];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    collectAppAssets().then((assets) =>
      caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }

          return caches.match(event.request).then((fallback) => fallback ?? caches.match("/"));
        });
    }),
  );
});
