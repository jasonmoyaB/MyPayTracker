// UX-02jm-T01: traduce cualquier error (fetch, GoTrue, PostgREST) a un tipo y un mensaje amigable.
// Se decide por la forma del error, sin importar clases del SDK.
export type AppErrorKind = 'offline' | 'session' | 'credentials' | 'forbidden' | 'invalid' | 'unknown'
export type AppError = { kind: AppErrorKind; message: string }

const MESSAGES: Record<AppErrorKind, string> = {
  offline: 'Sin conexión. Revisa tu internet e intenta de nuevo.',
  session: 'Tu sesión venció, vuelve a entrar.',
  credentials: 'Correo o contraseña incorrectos.',
  forbidden: 'No tienes permiso para hacer esto.',
  invalid: 'Algún dato no es válido. Revísalo e intenta de nuevo.',
  unknown: 'Algo salió mal. Intenta de nuevo.',
}

const SESSION_CODES = ['refresh_token_not_found', 'session_expired', 'session_not_found', 'bad_jwt', 'PGRST301', 'PGRST303']

type Shape = { name: string; message: string; code: string; status: number | undefined }

function shapeOf(e: unknown): Shape {
  const o = (typeof e === 'object' && e !== null ? e : {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  return { name: str(o.name), message: str(o.message), code: str(o.code), status: typeof o.status === 'number' ? o.status : undefined }
}

function kindOf(e: unknown): AppErrorKind {
  const { name, message, code, status } = shapeOf(e)
  // Solo errores de red; un TypeError cualquiera es un bug y no debe ocultarse como "sin conexión".
  if (name === 'AuthRetryableFetchError' || /failed to fetch|networkerror|load failed/i.test(message)) return 'offline'
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) return 'credentials'
  if (status === 401 || SESSION_CODES.includes(code) || name === 'AuthSessionMissingError' || /jwt expired/i.test(message)) return 'session'
  if (status === 403 || code === '42501') return 'forbidden'
  if (/^2[23][0-9A-Z]{3}$/.test(code)) return 'invalid'
  return 'unknown'
}

export function toAppError(e: unknown): AppError {
  const kind = kindOf(e)
  return { kind, message: MESSAGES[kind] }
}
