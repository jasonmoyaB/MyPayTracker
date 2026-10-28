import { useEffect, useState } from 'react'
import { deleteSubscription, saveSubscription } from '../../data/push'
import { saveWithToast } from '../toast/saveWithToast'
import { useToast, type ToastApi } from '../toast/ToastProvider'
import { base64UrlToBytes, pushStatus, STATUS_TEXT, type PushEnv, type PushStatus } from './pushState'

// PWA-01jm-T05: activar/desactivar las notificaciones push de este dispositivo (en Cuenta).
export type PushDeps = {
  requestPermission: () => Promise<NotificationPermission>
  manager: Pick<PushManager, 'subscribe' | 'getSubscription'>
  key: Uint8Array<ArrayBuffer>
  save: typeof saveSubscription
  remove: typeof deleteSubscription
}

// El permiso se pide solo aquí (al tocar el botón). Si no se guarda, se deshace en el navegador.
export async function turnOn(deps: PushDeps, toast: ToastApi): Promise<PushStatus> {
  const permission = await deps.requestPermission()
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'off'
  const failed = await saveWithToast(async () => {
    const sub = await deps.manager.subscribe({ userVisibleOnly: true, applicationServerKey: deps.key })
    await deps.save(sub.toJSON()).catch(async (e: unknown) => { await sub.unsubscribe(); throw e })
  }, toast, 'Notificaciones activadas')
  return failed ? 'off' : 'on'
}

// Primero se borra en el servidor: si falla, el dispositivo sigue suscrito y sigue recibiendo.
export async function turnOff(deps: PushDeps, toast: ToastApi): Promise<PushStatus> {
  const failed = await saveWithToast(async () => {
    const sub = await deps.manager.getSubscription()
    if (!sub) return
    await deps.remove(sub.endpoint)
    await sub.unsubscribe()
  }, toast, 'Notificaciones desactivadas')
  return failed ? 'on' : 'off'
}

const VAPID_KEY: string | undefined = import.meta.env.VITE_VAPID_PUBLIC_KEY

function readEnv(): Omit<PushEnv, 'subscribed'> {
  const nav = navigator as Navigator & { standalone?: boolean }
  return {
    configured: Boolean(VAPID_KEY),
    supported: 'serviceWorker' in nav && 'PushManager' in window && 'Notification' in window,
    ios: /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1),
    standalone: matchMedia('(display-mode: standalone)').matches || nav.standalone === true,
    permission: 'Notification' in window ? Notification.permission : 'default',
  }
}

async function readyDeps(): Promise<PushDeps> {
  const { pushManager } = await navigator.serviceWorker.ready
  return { requestPermission: () => Notification.requestPermission(), manager: pushManager,
    key: base64UrlToBytes(VAPID_KEY ?? ''), save: saveSubscription, remove: deleteSubscription }
}

export function PushToggle() {
  const toast = useToast()
  const [status, setStatus] = useState<PushStatus>('checking')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const env = readEnv()
    const initial = pushStatus({ ...env, subscribed: null })
    setStatus(initial)
    if (initial !== 'checking') return
    // Sin service worker registrado (dev) `ready` no resuelve y se queda en "Comprobando…".
    void readyDeps().then((d) => d.manager.getSubscription())
      .then((sub) => setStatus(pushStatus({ ...env, subscribed: sub !== null })))
  }, [])
  async function toggle() {
    setBusy(true)
    try {
      const deps = await readyDeps()
      setStatus(await (status === 'on' ? turnOff(deps, toast) : turnOn(deps, toast)))
    } finally {
      setBusy(false)
    }
  }
  return <PushToggleView status={status} busy={busy} onToggle={() => void toggle()} />
}

type ViewProps = { status: PushStatus; busy: boolean; onToggle: () => void }

export function PushToggleView({ status, busy, onToggle }: ViewProps) {
  const canToggle = status === 'on' || status === 'off'
  return (
    <section className="card" aria-labelledby="push-title">
      <h2 id="push-title">Notificaciones</h2>
      <p className="muted" role="status" style={{ margin: 0 }}>{STATUS_TEXT[status]}</p>
      {canToggle && (
        <div>
          <button type="button" className={status === 'on' ? 'secondary' : undefined} disabled={busy}
            onClick={onToggle}>{status === 'on' ? 'Desactivar' : 'Activar notificaciones'}</button>
        </div>
      )}
    </section>
  )
}
