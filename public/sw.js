// Service Worker para mejorar cache y performance
const CACHE_NAME = 'dandi-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/imgDandi.png',
  '/imgBanner.png',
  '/bannermap.svg',
  '/Logotipo.svg'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Estrategia: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Solo cachear GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Filtrar schemes no soportados
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // No cachear requests a API de Supabase
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar respuesta para cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {
              // Ignorar errores de cache silenciosamente
            });
          });
        return response;
      })
      .catch(() => {
        // Si falla network, buscar en cache
        return caches.match(event.request);
      })
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
