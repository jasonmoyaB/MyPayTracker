import type { Toast } from './toastQueue'
import './toast.css'

type Props = { toasts: Toast[]; onClose: (id: number) => void }

// Dos regiones vivas fijas (siempre montadas) para que el lector de pantalla anuncie lo que entra.
export function ToastRegion({ toasts, onClose }: Props) {
  return (
    <div className="toasts">
      <div role="status" aria-atomic="false">{toasts.filter((t) => t.kind === 'success').map((t) => <Item key={t.id} toast={t} onClose={onClose} />)}</div>
      <div role="alert" aria-atomic="false">{toasts.filter((t) => t.kind === 'error').map((t) => <Item key={t.id} toast={t} onClose={onClose} />)}</div>
    </div>
  )
}

function Item({ toast, onClose }: { toast: Toast; onClose: Props['onClose'] }) {
  return (
    <div className={`toast toast-${toast.kind}`}>
      <span>{toast.message}</span>
      <button type="button" className="secondary" aria-label="Cerrar aviso" onClick={() => onClose(toast.id)}>×</button>
    </div>
  )
}
