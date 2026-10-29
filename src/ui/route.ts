import { useSyncExternalStore } from 'react'

export const ROUTES = ['resumen', 'movimientos', 'recordatorios', 'cuenta', 'opciones'] as const
export type Route = (typeof ROUTES)[number]

// Hash desconocido o vacío → Resumen (sección inicial).
export function parseRoute(hash: string): Route {
  const name = hash.replace(/^#\//, '')
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : 'resumen'
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// Sin librería de rutas: el hash sobrevive a recargar y atrás/adelante funciona solo.
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => parseRoute(window.location.hash), () => 'resumen')
}

// Al cambiar de sección: arriba del todo y foco al título de la pantalla (lector de pantalla y teclado).
export function showScreenTop(content: Pick<ParentNode, 'querySelector'> | null, scrollTo: (x: number, y: number) => void) {
  scrollTo(0, 0)
  content?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}
