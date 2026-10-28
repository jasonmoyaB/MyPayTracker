import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { pushToast, removeToast, TOAST_MS, type Toast } from './toastQueue'
import { ToastRegion } from './ToastRegion'

export type ToastApi = { success: (message: string) => void; error: (message: string) => void }

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast necesita estar dentro de <ToastProvider>')
  return api
}

// UX-02jm-T08: temporizadores de cierre automático; se cancelan al cerrar a mano y al desmontar.
export function toastTimers(onExpire: (id: number) => void) {
  const pending = new Map<number, ReturnType<typeof setTimeout>>()
  return {
    start: (id: number) => { pending.set(id, setTimeout(() => { pending.delete(id); onExpire(id) }, TOAST_MS)) },
    cancel: (id: number) => { clearTimeout(pending.get(id)); pending.delete(id) },
    clear: () => { pending.forEach(clearTimeout); pending.clear() },
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const [timers] = useState(() => toastTimers((id) => setToasts((list) => removeToast(list, id))))
  useEffect(() => timers.clear, [timers])
  const close = useCallback((id: number) => {
    timers.cancel(id)
    setToasts((list) => removeToast(list, id))
  }, [timers])
  const show = useCallback((kind: Toast['kind'], message: string) => {
    const id = ++nextId.current
    setToasts((list) => pushToast(list, { id, kind, message }))
    timers.start(id)
  }, [timers])
  const api = useMemo<ToastApi>(() => ({
    success: (m) => show('success', m),
    error: (m) => show('error', m),
  }), [show])
  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion toasts={toasts} onClose={close} />
    </ToastContext.Provider>
  )
}
