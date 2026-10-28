// PWA-01jm-T01: solo notificaciones push. Sin caché offline (fuera de alcance).
const MOVEMENTS_URL = '/#/movimientos'

self.addEventListener('install', () => self.skipWaiting())
// claim: la página abierta queda controlada y el clic puede navegarla sin recargar antes.
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch { payload = { body: event.data.text() } }
  const { title = 'MyPayTracker', body = '' } = payload
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/favicon-32.png',
    data: { url: MOVEMENTS_URL },
  }))
})

// Enfoca una ventana ya abierta y la lleva a Movimientos; si no hay, abre una.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || MOVEMENTS_URL
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const client = windows[0]
    if (!client) return self.clients.openWindow(url)
    return client.navigate(url).catch(() => null).then((navigated) => (navigated || client).focus())
  }))
})
