// PWA-01jm-T05: lógica pura del interruptor de notificaciones (probada sin navegador).
export type PushStatus = 'unconfigured' | 'install-ios' | 'unsupported' | 'blocked' | 'checking' | 'on' | 'off'

export type PushEnv = {
  configured: boolean // hay VITE_VAPID_PUBLIC_KEY
  supported: boolean // serviceWorker + PushManager + Notification
  ios: boolean
  standalone: boolean // abierta como app instalada
  permission: NotificationPermission
  subscribed: boolean | null // null = todavía consultando
}

export function pushStatus(env: PushEnv): PushStatus {
  if (!env.configured) return 'unconfigured'
  // En iPhone solo hay push si la app está instalada en el inicio.
  if (env.ios && !env.standalone) return 'install-ios'
  if (!env.supported) return 'unsupported'
  if (env.permission === 'denied') return 'blocked'
  if (env.subscribed === null) return 'checking'
  return env.subscribed ? 'on' : 'off'
}

export const STATUS_TEXT: Record<PushStatus, string> = {
  unconfigured: 'Notificaciones no configuradas.',
  'install-ios': 'Instala la app: Compartir → Agregar a inicio. Luego actívalas desde aquí.',
  unsupported: 'Este navegador no permite notificaciones.',
  blocked: 'Bloqueadas en el navegador. Permítelas en los ajustes del sitio para activarlas.',
  checking: 'Comprobando…',
  on: 'Notificaciones activas en este dispositivo.',
  off: 'Notificaciones desactivadas.',
}

// Clave pública VAPID (base64url) → bytes para `applicationServerKey`.
export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}
