import { useSyncExternalStore } from 'react'

export const ROUTES = ['resumen', 'movimientos', 'cuenta'] as const
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
