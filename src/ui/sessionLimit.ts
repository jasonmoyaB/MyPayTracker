import { sessionExpiry, type ExpiryReason } from '../domain/sessionLimit'

const CHECK_MS = 15_000

type ActivityTarget = {
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

// AUTH-02jm-T03: los temporizadores se suspenden en segundo plano; por eso también se revisa en visibilitychange (AC-5).
export function watchSessionLimit(signedInAt: number, onExpire: (reason: ExpiryReason) => void, doc: ActivityTarget = document): () => void {
  let lastActivityAt = Date.now()
  const onActivity = () => { lastActivityAt = Date.now() }
  const check = () => {
    const reason = sessionExpiry(Date.now(), lastActivityAt, signedInAt)
    if (reason) { stop(); onExpire(reason) }
  }
  const listeners = [['pointerdown', onActivity], ['keydown', onActivity], ['visibilitychange', check]] as const
  const timer = setInterval(check, CHECK_MS)
  listeners.forEach(([type, fn]) => doc.addEventListener(type, fn))
  const stop = () => {
    clearInterval(timer)
    listeners.forEach(([type, fn]) => doc.removeEventListener(type, fn))
  }
  // AUTH-02jm-T03: al recargar con una sesión ya vencida no se llegan a ver los datos.
  check()
  return stop
}
