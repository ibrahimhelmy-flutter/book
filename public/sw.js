/**
 * Service Worker for Egyptian AI Programming Curriculum Platform
 * Provides robust offline support, App Shell caching, and custom offline-pack caching.
 */

const APP_VERSION = '1.0.1';
const CONTENT_VERSION = '2026.09.11';
const CACHE_VERSION = `v${APP_VERSION}`;
const APP_SHELL_CACHE = `ai-curriculum-shell-${CACHE_VERSION}`;
const OFFLINE_PACK_CACHE = `ai-curriculum-offline-pack-${CACHE_VERSION}`;

// Pre-cached App Shell assets
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './exams/',
  './glossary/',
  './simulators/',
  './dashboard/'
];

// Install Event: Cache App Shell (does NOT force skipWaiting to prevent mid-session chunk mismatch)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some precache assets failed to load:', err);
      });
    })
  );
});

// Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_SHELL_CACHE, OFFLINE_PACK_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent Offline Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore browser extensions or non-http protocols
  if (!url.protocol.startsWith('http')) return;

  // Strategy 1: Static assets (Images, Fonts, CSS, JS, Chunks) -> Cache First
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

  // Strategy 2: Navigation & HTML Pages -> Stale-While-Revalidate with Offline Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(async () => {
        // 1. Direct match with ignoreSearch
        const cachedRoute = await caches.match(request, { ignoreSearch: true });
        if (cachedRoute) return cachedRoute;

        // 2. Trailing slash and index.html variations
        const cleanPath = url.pathname;
        const altPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : `${cleanPath}/`;
        const altCached =
          (await caches.match(altPath, { ignoreSearch: true })) ||
          (await caches.match(`${url.origin}${altPath}`, { ignoreSearch: true })) ||
          (await caches.match(`${cleanPath}index.html`, { ignoreSearch: true })) ||
          (await caches.match(`${url.origin}${cleanPath}index.html`, { ignoreSearch: true }));
        if (altCached) return altCached;

        // 3. Fallback to cached home page
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
      })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Message Event: Handle User-Initiated Offline Pack Download and Safe Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'CACHE_OFFLINE_PACK') {
    const urlsToCache = event.data.urls || [];
    const sourceClient = event.source;

    caches.open(OFFLINE_PACK_CACHE).then(async (cache) => {
      let successful = 0;
      const failedUrls = [];
      const total = urlsToCache.length;

      for (const url of urlsToCache) {
        try {
          const fullUrl = new URL(url, self.location.href).href;
          const response = await fetch(fullUrl);
          if (response && response.status === 200) {
            const respClone = response.clone();
            await cache.put(fullUrl, respClone);
            const pathname = new URL(fullUrl).pathname;
            if (pathname !== fullUrl) {
              await cache.put(pathname, response.clone());
            }
            successful++;

            // If HTML route, discover and cache its static JS chunks and CSS stylesheets for seamless offline navigation
            if (url.endsWith('/') || url.endsWith('.html') || !url.includes('.')) {
              try {
                const htmlText = await response.text();
                const re = /(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g;
                let match;
                while ((match = re.exec(htmlText)) !== null) {
                  const chunkPath = match[1];
                  const chunkFullUrl = new URL(chunkPath, self.location.href).href;
                  try {
                    const chunkResp = await fetch(chunkFullUrl);
                    if (chunkResp && chunkResp.status === 200) {
                      await cache.put(chunkFullUrl, chunkResp);
                    }
                  } catch {}
                }
              } catch (parseErr) {
                console.warn('Chunk discovery warning:', parseErr);
              }
            }
          } else {
            failedUrls.push(url);
          }
        } catch (e) {
          console.warn(`Failed to cache ${url} in offline pack:`, e);
          failedUrls.push(url);
        }

        if (sourceClient && sourceClient.postMessage) {
          sourceClient.postMessage({
            type: 'OFFLINE_PACK_PROGRESS',
            completed: successful + failedUrls.length,
            successful,
            failedCount: failedUrls.length,
            total,
            url
          });
        }
      }

      if (sourceClient && sourceClient.postMessage) {
        sourceClient.postMessage({
          type: 'OFFLINE_PACK_COMPLETE',
          total,
          successful,
          failedUrls,
          isFullSuccess: failedUrls.length === 0
        });
      }
    });
  }
});
