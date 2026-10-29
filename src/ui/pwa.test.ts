import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('PWA-01jm AC-1: instalable', () => {
  const manifest = JSON.parse(read('../../public/manifest.webmanifest'))
  it('manifest con nombre, inicio, standalone e iconos 192/512', () => {
    expect(manifest).toMatchObject({ name: 'MyPayTracker', short_name: 'MyPayTracker', start_url: '/', display: 'standalone' })
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
  })
  it('index.html enlaza el manifest y cubre el área segura', () => {
    const html = read('../../index.html')
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />')
    expect(html).toMatch(/name="viewport" content="[^"]*viewport-fit=cover/)
  })
  it('main.tsx registra /sw.js solo en producción y si hay soporte', () => {
    const main = read('./main.tsx')
    expect(main).toMatch(/import\.meta\.env\.PROD && 'serviceWorker' in navigator/)
    expect(main).toContain("navigator.serviceWorker.register('/sw.js')")
  })
})

// Ejecuta public/sw.js con un `self` falso y devuelve sus manejadores.
function loadWorker(windows: unknown[] = []) {
  const handlers: Record<string, (e: unknown) => void> = {}
  const self = {
    addEventListener: (type: string, fn: (e: unknown) => void) => { handlers[type] = fn },
    registration: { showNotification: vi.fn(async () => {}) },
    clients: { matchAll: vi.fn(async () => windows), openWindow: vi.fn(async () => null), claim: vi.fn(async () => {}) },
    skipWaiting: vi.fn(async () => {}),
  }
  new Function('self', read('../../public/sw.js'))(self)
  const fire = async (type: string, event: object) => {
    let done: Promise<unknown> = Promise.resolve()
    handlers[type]({ ...event, waitUntil: (p: Promise<unknown>) => { done = p } })
    await done
  }
  return { self, fire }
}

describe('PWA-01jm service worker', () => {
  it('AC-5: push muestra título y cuerpo con icono y destino Movimientos', async () => {
    const { self, fire } = loadWorker()
    await fire('push', { data: { json: () => ({ title: 'Gasto', body: '₡3 490,00 · Super' }) } })
    expect(self.registration.showNotification).toHaveBeenCalledWith('Gasto', expect.objectContaining({
      body: '₡3 490,00 · Super', icon: '/icons/icon-192.png', data: { url: '/#/movimientos' },
    }))
  })
  it('REC-01jm-T05: abre la URL del aviso solo si es una sección de la app (/#/...)', async () => {
    const { self, fire } = loadWorker()
    await fire('push', { data: { json: () => ({ title: 'Recordatorio de pago', body: 'x', url: '/#/recordatorios' }) } })
    await fire('push', { data: { json: () => ({ title: 'Otro', body: 'x', url: 'https://otro.sitio/#/' }) } })
    const urls = self.registration.showNotification.mock.calls.map((c: unknown[]) => (c[1] as { data: { url: string } }).data.url)
    expect(urls).toEqual(['/#/recordatorios', '/#/movimientos'])
  })
  it('AC-7: clic enfoca la ventana abierta y la lleva a Movimientos', async () => {
    const client = { navigate: vi.fn(async () => client), focus: vi.fn(async () => client) }
    const { self, fire } = loadWorker([client])
    const close = vi.fn()
    await fire('notificationclick', { notification: { close, data: { url: '/#/movimientos' } } })
    expect(close).toHaveBeenCalled()
    expect(client.navigate).toHaveBeenCalledWith('/#/movimientos')
    expect(client.focus).toHaveBeenCalled()
    expect(self.clients.openWindow).not.toHaveBeenCalled()
  })
  it('AC-7: sin ventana abierta, abre la app en Movimientos', async () => {
    const { self, fire } = loadWorker([])
    await fire('notificationclick', { notification: { close: vi.fn(), data: { url: '/#/movimientos' } } })
    expect(self.clients.openWindow).toHaveBeenCalledWith('/#/movimientos')
  })
})
