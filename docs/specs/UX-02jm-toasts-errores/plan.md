# UX-02jm — Plan

## Base
spec.md de esta carpeta. Hoy `MoneySetting`, `useTransactionForm`, `LoginView` y `App` interpolan `e.message`.

## Módulos

### 1. Traducción de errores (`src/data/errors.ts`)
- `toAppError(e): { kind, message }` con `kind` ∈ `offline | session | credentials | forbidden | invalid | unknown`.
- Reglas por forma del error, sin importar el SDK: `TypeError`/"Failed to fetch" → offline;
  status 401 o códigos de JWT vencido/`refresh_token_not_found` → session; `invalid_credentials` → credentials;
  status 403 o código Postgres `42501` → forbidden; códigos `22xxx`/`23xxx` → invalid; resto → unknown.
- Mensajes en español fijos por `kind`. Probado con tabla de casos.

### 2. Toasts (`src/ui/toast/`)
- `ToastProvider` + `useToast()` (`success(msg)`, `error(msg)`); cola máx. 3; cierre automático 4 s; botón cerrar.
- Región `role="status"` para éxito y `role="alert"` para error; estilo vidrio (UX-01jm).
- Lógica de cola pura (`toastQueue.ts`) probada aparte.

### 3. Uso en pantallas
- `MoneySetting`, `useTransactionForm`, `App.load`, `LoginView`: `catch` → `toAppError` → toast o mensaje inline;
  éxito → `success`.
- Los formularios no se limpian si falla.
- `kind === 'session'` → `signOut()` y aviso "Tu sesión venció, vuelve a entrar".

### 4. Fallbacks globales
- `ErrorBoundary` (clase React) en `main.tsx`: pantalla "Algo salió mal" + "Recargar".
- `src/data/supabase.ts`: no lanzar al importar; exponer `configError` y `main.tsx` muestra aviso.
- `unhandledrejection` en `window` → toast genérico (vía provider).

### 5. Edge Function
- `catch`: `console.error` con el detalle; respuesta `{ error: 'sync_failed' }` 500 sin texto interno.

## Riesgos
- Un ErrorBoundary no captura errores async: por eso cada `catch` usa `toAppError`.
- Cambiar la función exige redeploy (pendiente del usuario).
