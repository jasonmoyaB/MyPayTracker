// CRON-02jm: el cron guarda pagos nuevos cada 5 min; la pantalla abierta los trae sola.
const EVERY_MS = 60_000

type VisibilityTarget = Pick<Document, 'visibilityState'> & {
  addEventListener(type: 'visibilitychange', listener: () => void): void
  removeEventListener(type: 'visibilitychange', listener: () => void): void
}

// Recarga cada minuto solo con la pestaña visible, y al volver a ella. Devuelve la limpieza.
export function autoRefresh(load: () => void, doc: VisibilityTarget = document): () => void {
  const ifVisible = () => { if (doc.visibilityState === 'visible') load() }
  const timer = setInterval(ifVisible, EVERY_MS)
  doc.addEventListener('visibilitychange', ifVisible)
  return () => {
    clearInterval(timer)
    doc.removeEventListener('visibilitychange', ifVisible)
  }
}
