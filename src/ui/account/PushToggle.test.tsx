import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { base64UrlToBytes, pushStatus, type PushEnv } from './pushState'
import { PushToggleView, turnOff, turnOn, type PushDeps } from './PushToggle'

vi.mock('../../data/push', () => ({ saveSubscription: vi.fn(), deleteSubscription: vi.fn() }))
vi.mock('../../data/auth', () => ({ endExpiredSession: vi.fn(async () => {}) }))

describe('base64UrlToBytes (applicationServerKey)', () => {
  it('decodifica base64url sin relleno', () => {
    expect([...base64UrlToBytes('-_8')]).toEqual([0xfb, 0xff])
    expect([...base64UrlToBytes('AQID')]).toEqual([1, 2, 3])
  })
})

describe('PWA-01jm AC-3: estado de las notificaciones', () => {
  const env: PushEnv = { configured: true, supported: true, ios: false, standalone: false, permission: 'default', subscribed: false }
  it.each<[string, Partial<PushEnv>, string]>([
    ['sin clave VAPID', { configured: false }, 'unconfigured'],
    ['iPhone sin instalar', { ios: true, supported: false }, 'install-ios'],
    ['iPhone instalada', { ios: true, standalone: true }, 'off'],
    ['navegador sin push', { supported: false }, 'unsupported'],
    ['permiso denegado', { permission: 'denied', subscribed: true }, 'blocked'],
    ['comprobando', { subscribed: null }, 'checking'],
    ['suscrito', { subscribed: true, permission: 'granted' }, 'on'],
    ['sin suscripción', {}, 'off'],
  ])('%s → %s', (_, change, status) => expect(pushStatus({ ...env, ...change })).toBe(status))

  const view = (status: Parameters<typeof PushToggleView>[0]['status']) =>
    renderToStaticMarkup(<PushToggleView status={status} busy={false} onToggle={() => {}} />)
  it('textos de cada estado y botón solo cuando se puede actuar', () => {
    expect(view('on')).toContain('Notificaciones activas en este dispositivo')
    expect(view('on')).toContain('>Desactivar</button>')
    expect(view('off')).toContain('>Activar notificaciones</button>')
    expect(view('blocked')).toContain('Bloqueadas en el navegador')
    expect(view('install-ios')).toContain('Instala la app: Compartir → Agregar a inicio')
    expect(view('unsupported')).toContain('no permite notificaciones')
    expect(view('unconfigured')).toContain('Notificaciones no configuradas')
    for (const s of ['blocked', 'install-ios', 'unsupported', 'unconfigured'] as const) expect(view(s)).not.toContain('<button')
  })
})

function fakes(permission: NotificationPermission = 'granted', existing: PushSubscription | null = null) {
  const sub = { toJSON: () => ({ endpoint: 'https://e/1', keys: { p256dh: 'P', auth: 'A' } }), endpoint: 'https://e/1',
    unsubscribe: vi.fn(async () => true) }
  const deps: PushDeps = {
    requestPermission: vi.fn(async () => permission),
    manager: { subscribe: vi.fn(async () => sub as unknown as PushSubscription), getSubscription: vi.fn(async () => existing) },
    key: new Uint8Array([1]),
    save: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
  }
  const toast = { success: vi.fn(), error: vi.fn() }
  return { sub, deps, toast }
}

describe('PWA-01jm AC-2: activar', () => {
  it('pide permiso, suscribe con la clave y guarda', async () => {
    const { sub, deps, toast } = fakes()
    expect(await turnOn(deps, toast)).toBe('on')
    expect(deps.manager.subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: deps.key })
    expect(deps.save).toHaveBeenCalledWith(sub.toJSON())
    expect(toast.success).toHaveBeenCalledWith('Notificaciones activadas')
  })
  it('permiso denegado → bloqueadas, sin suscribir', async () => {
    const { deps, toast } = fakes('denied')
    expect(await turnOn(deps, toast)).toBe('blocked')
    expect(deps.manager.subscribe).not.toHaveBeenCalled()
  })
  it('si no se pudo guardar, deshace la suscripción del navegador y avisa', async () => {
    const { sub, deps, toast } = fakes()
    vi.mocked(deps.save).mockRejectedValueOnce(new Error('x'))
    expect(await turnOn(deps, toast)).toBe('off')
    expect(sub.unsubscribe).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
  })
})

describe('PWA-01jm AC-4: desactivar', () => {
  it('borra la suscripción guardada y la del navegador', async () => {
    const { sub, deps, toast } = fakes('granted')
    vi.mocked(deps.manager.getSubscription).mockResolvedValueOnce(sub as unknown as PushSubscription)
    expect(await turnOff(deps, toast)).toBe('off')
    expect(deps.remove).toHaveBeenCalledWith('https://e/1')
    expect(sub.unsubscribe).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Notificaciones desactivadas')
  })
  it('si falla el borrado sigue activa', async () => {
    const { sub, deps, toast } = fakes('granted')
    vi.mocked(deps.manager.getSubscription).mockResolvedValueOnce(sub as unknown as PushSubscription)
    vi.mocked(deps.remove).mockRejectedValueOnce(new Error('x'))
    expect(await turnOff(deps, toast)).toBe('on')
    expect(sub.unsubscribe).not.toHaveBeenCalled()
  })
})
