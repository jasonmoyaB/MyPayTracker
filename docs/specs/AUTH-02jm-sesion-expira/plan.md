# AUTH-02jm — Plan

## Base
spec.md de esta carpeta. Reutiliza `src/data/auth.ts` (`endExpiredSession`, `onSessionChange`), el patrón de `src/ui/autoRefresh.ts` (intervalo + `visibilitychange`, documento inyectable para tests) y los toasts de UX-02jm.

## Módulos

### 1. Regla pura (`src/domain/sessionLimit.ts`)
- Constantes `INACTIVITY_MS` (5 min) y `MAX_SESSION_MS` (30 min).
- `sessionExpiry(now, lastActivityAt, signedInAt)` → `'inactividad' | 'maximo' | null`. El máximo gana si ambos vencen.
- Probada con tabla de casos (justo en el límite, uno de más, ambos).

### 2. Datos (`src/data/supabase.ts`, `src/data/auth.ts`)
- El cliente real usa `auth.storage: sessionStorage`: se borra al cerrar ventana/pestaña y sobrevive a recargas (AC-1).
- Al crear el cliente se borran de `localStorage` las claves `sb-*` de la sesión vieja (AC-2).
- `Session` suma `signedInAt` (ms) desde `user.last_sign_in_at`; el refresco del token no lo cambia.
- `endExpiredSession` no lanza; si `signOut` local devuelve error (sin red) borra igual las claves `sb-*` de `sessionStorage` (AC-6).

### 3. Vigilancia en UI (`src/ui/sessionLimit.ts`)
- `watchSessionLimit(signedInAt, onExpire, doc = document)`: registra `pointerdown`/`keydown` como actividad,
  revisa con intervalo (15 s) y en `visibilitychange` al volver (AC-5). Llama `onExpire(motivo)` una sola vez. Devuelve la limpieza.
- Mismo estilo que `autoRefresh` (sin hook nuevo, se monta con `useEffect`).

### 4. Montaje (`src/ui/App.tsx`)
- Con sesión, `useEffect(() => watchSessionLimit(...))`. Al vencer: `setSession(null)` inmediato (bloquea aunque falle la red, AC-6),
  `endExpiredSession()` y toast de error con el mensaje del motivo (AC-3/AC-4).
- La URL no se toca, así que `authorization_id` sigue tras volver a entrar (AC-7).

## Riesgos
- `sessionStorage` en PWA instalada: al matar la app se pierde (lo deseado). En iOS puede sobrevivir si el sistema solo suspende; el límite de inactividad lo cubre.
- Temporizadores suspendidos en segundo plano: por eso se revisa también en `visibilitychange`.
- El JWT emitido sigue válido hasta 1 h en el servidor si alguien lo copió; se mitiga revocando el refresh token (`signOut` local) y se recomienda activar los límites de sesión del dashboard de Supabase (cambio remoto, lo decide el dev).
