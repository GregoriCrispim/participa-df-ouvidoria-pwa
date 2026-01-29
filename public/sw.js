/**
 * Service Worker - Participa DF PWA
 * 
 * Gerencia cache offline e notificações push.
 * Estratégias de cache:
 * - Cache First: assets estáticos (CSS, JS, imagens)
 * - Network First: chamadas de API
 * - Stale While Revalidate: páginas HTML
 */

const CACHE_NAME = 'participa-df-v1'
const STATIC_CACHE = 'participa-df-static-v1'
const API_CACHE = 'participa-df-api-v1'

// Arquivos para pré-cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pré-cacheando assets estáticos')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignora requisições não-GET
  if (request.method !== 'GET') return
  
  // Ignora chrome-extension e outras requisições não-http
  if (!url.protocol.startsWith('http')) return
  
  // Estratégia para API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }
  
  // Estratégia para assets estáticos
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
  
  // Estratégia padrão para páginas HTML
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME))
})

/**
 * Verifica se é um asset estático
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2']
  return staticExtensions.some(ext => pathname.endsWith(ext))
}

/**
 * Estratégia Cache First
 * Retorna do cache se disponível, senão busca na rede
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Falha ao buscar:', request.url)
    return new Response('Offline', { status: 503 })
  }
}

/**
 * Estratégia Network First
 * Tenta buscar na rede, usa cache como fallback
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Usando cache para:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(
      JSON.stringify({ error: 'Você está offline', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * Estratégia Stale While Revalidate
 * Retorna cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(cacheName)
          .then(cache => cache.put(request, networkResponse.clone()))
      }
      return networkResponse
    })
    .catch(() => null)
  
  return cachedResponse || fetchPromise || new Response('Offline', { status: 503 })
}

// Evento de mensagem (para comunicação com a página)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Notificações Push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body || 'Você tem uma atualização na sua manifestação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/consulta'
    },
    actions: [
      { action: 'open', title: 'Ver detalhes' },
      { action: 'close', title: 'Fechar' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Participa DF', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'close') return
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Se já há uma janela aberta, foca nela
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // Senão, abre nova janela
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})
