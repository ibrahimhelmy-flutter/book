/**
 * Service Worker for Egyptian AI Programming Curriculum Platform
 * Provides robust offline support, App Shell caching, and custom offline-pack caching.
 */

// Keep in sync with APP_VERSION / CURRENT_CONTENT_VERSION in src/lib/offline-db.ts (bump together).
const APP_VERSION = '2.0.0';
const CONTENT_VERSION = '2026.10.12';
const CACHE_VERSION = `v${APP_VERSION}`;
const APP_SHELL_CACHE = `ai-curriculum-shell-${CACHE_VERSION}`;
// One cache per downloaded part: `${PACK_CACHE_PREFIX}<grade>/<book>/<part>` (see packCacheName in offline-db.ts)
const PACK_CACHE_PREFIX = `ai-curriculum-pack-${CACHE_VERSION}::`;
const packCacheName = (partKey) => `${PACK_CACHE_PREFIX}${partKey}`;
const PACK_FETCH_CONCURRENCY = 6;

// Pre-cached App Shell assets
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './dashboard/',
  './data/catalog.json'
];

// Install Event: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some precache assets failed to load:', err);
      });
    })
  );
});

// Activate Event: Keep the current shell cache and this version's per-part pack caches; delete the rest
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL_CACHE && !key.startsWith(PACK_CACHE_PREFIX)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/** Store a fresh response in every cache that already holds `cacheKey` (pack caches included), else the shell cache. */
async function refreshCachedEverywhere(cacheKey, response) {
  const names = await caches.keys();
  let stored = false;
  for (const name of names) {
    if (name !== APP_SHELL_CACHE && !name.startsWith(PACK_CACHE_PREFIX)) continue;
    const cache = await caches.open(name);
    if (await cache.match(cacheKey, { ignoreSearch: true })) {
      await cache.put(cacheKey, response.clone());
      stored = true;
    }
  }
  if (!stored) {
    const shell = await caches.open(APP_SHELL_CACHE);
    await shell.put(cacheKey, response.clone());
  }
}

// Fetch Event: Intelligent Offline Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore browser extensions or non-http protocols
  if (!url.protocol.startsWith('http')) return;

  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // Strategy 0: Generated content data (`/data/**/*.json`, fetched as `?v=<contentHash>`).
  // Stale-while-revalidate keyed without the query: serve any cached copy (shell or pack cache)
  // immediately and refresh it in the background; go to the network only when nothing is cached.
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    const cacheKey = `${url.origin}${url.pathname}`;
    const offlineData = () => new Response('', { status: 504, statusText: 'Offline Data Unavailable' });
    const networkUpdate = fetch(request).then(async (networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        await refreshCachedEverywhere(cacheKey, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    });

    if (isLocalhost) {
      // Development: network first so regenerated data is visible immediately, cache when offline
      event.respondWith(
        networkUpdate.catch(async () => (await caches.match(cacheKey, { ignoreSearch: true })) || offlineData())
      );
      return;
    }

    event.respondWith(
      caches.match(cacheKey, { ignoreSearch: true }).then(
        (cachedResponse) => cachedResponse || networkUpdate.catch(offlineData)
      )
    );
    // Revalidate in the background (keeps the SW alive until the refreshed copy is stored)
    event.waitUntil(networkUpdate.catch(() => {}));
    return;
  }

  // Strategy 1: Static assets (Images, Fonts, CSS, JS, Chunks)
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/images/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    // On localhost, prioritize network so code changes are visible immediately, but fallback to cache if offline
    if (isLocalhost) {
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(APP_SHELL_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(async () => {
            const cachedResponse = await caches.match(request, { ignoreSearch: true });
            if (cachedResponse) return cachedResponse;
            if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
              const iconFallback = (await caches.match('./icon.svg')) || (await caches.match('/icon.svg'));
              if (iconFallback) return iconFallback;
            }
            return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
          })
      );
      return;
    }

    // Production: Cache First for instant performance
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch(async () => {
          // If image is offline and not in cache, fallback to vector icon
          if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
            const iconFallback = (await caches.match('./icon.svg')) || (await caches.match('/icon.svg'));
            if (iconFallback) return iconFallback;
          }
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        });
      })
    );
    return;
  }

  // Strategy 2: Next.js RSC payloads. With `output: "export"`, client-side <Link> navigation fetches
  // `<route>/index.txt?_rsc=...` instead of the HTML page. Network first, keyed without the query string.
  if (url.pathname.endsWith('.txt') && request.mode !== 'navigate') {
    const cacheKey = `${url.origin}${url.pathname}`;
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => {
            cache.put(cacheKey, responseToCache);
          });
        }
        return networkResponse;
      }).catch(async () => {
        const cachedPayload = await caches.match(cacheKey, { ignoreSearch: true });
        if (cachedPayload) return cachedPayload;
        // A non-OK response (not a network error) makes Next.js fall back to a full navigation
        // to the page URL with `/index.txt` stripped, which Strategy 3 can serve from cache.
        return new Response('', { status: 504, statusText: 'Offline RSC Payload Unavailable' });
      })
    );
    return;
  }

  // Strategy 3: Navigation & HTML Pages -> Stale-While-Revalidate with Offline Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    // 1. Direct match with ignoreSearch, then trailing-slash/index.html variations
    const findCachedPage = async () => {
      const cachedRoute = await caches.match(request, { ignoreSearch: true });
      if (cachedRoute) return cachedRoute;

      const cleanPath = url.pathname;
      const altPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : `${cleanPath}/`;
      return (
        (await caches.match(altPath, { ignoreSearch: true })) ||
        (await caches.match(`${url.origin}${altPath}`, { ignoreSearch: true })) ||
        (await caches.match(`${cleanPath}index.html`, { ignoreSearch: true })) ||
        (await caches.match(`${url.origin}${cleanPath}index.html`, { ignoreSearch: true })) ||
        null
      );
    };

    const offlineFallback = async () => {
      // Next.js can fall back to navigating to the RSC payload URL itself (`.../index.txt`).
      // Redirect to the page's HTML route instead of dropping the user on the home page.
      const cleanPath = url.pathname;
      if (cleanPath.endsWith('.txt')) {
        const htmlPath = cleanPath.endsWith('/index.txt')
          ? cleanPath.slice(0, -'index.txt'.length)
          : `${cleanPath.slice(0, -'.txt'.length)}/`;
        return Response.redirect(`${url.origin}${htmlPath}`, 302);
      }

      const homeFallback =
        (await caches.match('./')) ||
        (await caches.match('./index.html')) ||
        (await caches.match('/')) ||
        (await caches.match('/index.html'));
      if (homeFallback) return homeFallback;

      return new Response(
        `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>الوضع بدون إنترنت</title><style>body{font-family:sans-serif;background:#020617;color:#f8fafc;padding:3rem;text-align:center;}</style></head><body><h1>المنصة في وضع العمل بدون إنترنت 📡</h1><p>أنت تتصفح بدون اتصال بشبكة الإنترنت. يمكنك تصفح الدروس التي قمت بتحميلها مسبقاً.</p><a href="./" style="color:#818cf8;display:inline-block;margin-top:1rem;">العودة للصفحة الرئيسية</a></body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    };

    const networkUpdate = fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(APP_SHELL_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    });

    if (isLocalhost) {
      // Development: network first so regenerated pages are visible immediately
      event.respondWith(networkUpdate.catch(async () => (await findCachedPage()) || offlineFallback()));
      return;
    }

    // Production: serve any cached copy instantly (no waiting on a network timeout while
    // offline/flaky), and refresh it in the background so online users still get updates.
    event.respondWith(
      findCachedPage().then((cachedPage) => cachedPage || networkUpdate.catch(offlineFallback))
    );
    event.waitUntil(networkUpdate.catch(() => {}));
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cachedResponse = await caches.match(request, { ignoreSearch: true });
      return cachedResponse || Response.error();
    })
  );
});

// Message Event: Handle User-Initiated Offline Pack Download and Safe Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'CACHE_OFFLINE_PACK') {
    const { partKey } = event.data;
    if (!partKey) return;
    event.waitUntil(cacheOfflinePack(partKey, event.data.urls || [], !!event.data.prune, event.source));
    return;
  }

  if (event.data && event.data.type === 'DELETE_OFFLINE_PACK') {
    const { partKey } = event.data;
    if (!partKey) return;
    const sourceClient = event.source;
    event.waitUntil(
      caches.delete(packCacheName(partKey)).then((deleted) => {
        if (sourceClient && sourceClient.postMessage) {
          sourceClient.postMessage({ type: 'OFFLINE_PACK_DELETED', partKey, deleted });
        }
      })
    );
  }
});

/**
 * Download every url of one part's offline pack into its own cache. `urls` are already
 * basePath-prefixed by the client. Page HTML is also scanned for `/_next/static/` chunks.
 * With `prune`, entries not written by this run are removed afterwards (only on full success),
 * so updating a pack does not leave the previous build's files behind.
 */
async function cacheOfflinePack(partKey, urlsToCache, prune, sourceClient) {
  const post = (msg) => {
    if (sourceClient && sourceClient.postMessage) sourceClient.postMessage({ ...msg, partKey });
  };

  const cache = await caches.open(packCacheName(partKey));
  const total = urlsToCache.length;
  const failedUrls = [];
  const writtenKeys = new Set();
  const cachedChunks = new Set();
  let successful = 0;

  const put = async (key, response) => {
    const fullKey = new URL(key, self.location.href).href;
    writtenKeys.add(fullKey);
    await cache.put(fullKey, response);
  };

  const cacheOne = async (url) => {
    const fullUrl = new URL(url, self.location.href).href;
    // `no-cache` revalidates with the server, so an update never stores stale HTTP-cached files
    const response = await fetch(fullUrl, { cache: 'no-cache' });
    if (!response || response.status !== 200) throw new Error(`HTTP ${response && response.status}`);

    await put(fullUrl, response.clone());
    const pathname = new URL(fullUrl).pathname;
    if (pathname.endsWith('/')) {
      const noSlash = pathname.slice(0, -1);
      if (noSlash) await put(noSlash, response.clone());
    } else if (!pathname.includes('.')) {
      await put(`${pathname}/`, response.clone());
    }

    // If HTML route, discover and cache its static JS chunks and CSS stylesheets for seamless offline navigation
    if (pathname.endsWith('/') || pathname.endsWith('.html') || !pathname.includes('.')) {
      try {
        const htmlText = await response.text();
        const re = /(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g;
        let match;
        const chunkPromises = [];
        while ((match = re.exec(htmlText)) !== null) {
          const chunkFullUrl = new URL(match[1], self.location.href).href;
          if (cachedChunks.has(chunkFullUrl)) continue;
          cachedChunks.add(chunkFullUrl);
          chunkPromises.push(
            fetch(chunkFullUrl)
              .then((chunkResp) => {
                if (chunkResp && chunkResp.status === 200) return put(chunkFullUrl, chunkResp);
              })
              .catch(() => {})
          );
        }
        if (chunkPromises.length > 0) await Promise.all(chunkPromises);
      } catch (parseErr) {
        console.warn('Chunk discovery warning:', parseErr);
      }
    }
  };

  let next = 0;
  const worker = async () => {
    while (next < total) {
      const url = urlsToCache[next++];
      try {
        await cacheOne(url);
        successful++;
      } catch (e) {
        console.warn(`Failed to cache ${url} in offline pack ${partKey}:`, e);
        failedUrls.push(url);
      }
      post({
        type: 'OFFLINE_PACK_PROGRESS',
        completed: successful + failedUrls.length,
        successful,
        failedCount: failedUrls.length,
        total,
        url
      });
    }
  };
  await Promise.all(Array.from({ length: Math.min(PACK_FETCH_CONCURRENCY, total) }, worker));

  if (prune && failedUrls.length === 0) {
    try {
      const requests = await cache.keys();
      await Promise.all(requests.filter((req) => !writtenKeys.has(req.url)).map((req) => cache.delete(req)));
    } catch (pruneErr) {
      console.warn('Offline pack prune warning:', pruneErr);
    }
  }

  post({
    type: 'OFFLINE_PACK_COMPLETE',
    total,
    successful,
    failedUrls,
    isFullSuccess: failedUrls.length === 0
  });
}
