import { toUiError } from './sessionExpiry'

type RejectionTarget = {
  addEventListener(type: 'unhandledrejection', listener: (event: { reason: unknown }) => void): void
  removeEventListener(type: 'unhandledrejection', listener: (event: { reason: unknown }) => void): void
}

// UX-02jm-T05: una promesa sin capturar avisa con mensaje amigable; el detalle va a la consola. Devuelve la limpieza.
export function onUnhandledRejection(notify: (message: string) => void, target: RejectionTarget = window): () => void {
  const listener = (event: { reason: unknown }) => {
    console.error(event.reason)
    notify(toUiError(event.reason).message)
  }
  target.addEventListener('unhandledrejection', listener)
  return () => target.removeEventListener('unhandledrejection', listener)
}
