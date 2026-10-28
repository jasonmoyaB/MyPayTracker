import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { pushToast, removeToast, TOAST_MS, type Toast } from './toastQueue'
import { ToastRegion } from './ToastRegion'

export type ToastApi = { success: (message: string) => void; error: (message: string) => void }

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast necesita estar dentro de <ToastProvider>')
  return api
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const close = useCallback((id: number) => setToasts((list) => removeToast(list, id)), [])
  const show = useCallback((kind: Toast['kind'], message: string) => {
    const id = ++nextId.current
    setToasts((list) => pushToast(list, { id, kind, message }))
    setTimeout(() => close(id), TOAST_MS)
  }, [close])
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
