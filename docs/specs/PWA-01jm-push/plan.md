# PWA-01jm — Plan

## Base
spec.md de esta carpeta. Iconos de UX-01jm; pantalla Cuenta de DASH-01jm; función `sync-bac-emails`.

## Módulos

### 1. PWA (estático)
- `public/manifest.webmanifest`: name, short_name, start_url `/`, display standalone, theme/background color,
  iconos 192/512 (uno `purpose: maskable`).
- `public/sw.js`: eventos `push` (muestra notificación con `title`, `body`, `icon`, `data.url`) y
  `notificationclick` (enfoca una ventana abierta o abre `/#/movimientos`). Sin caché offline.
- `index.html`: `<link rel="manifest">`. `main.tsx`: registra `/sw.js` solo si `serviceWorker` existe.

### 2. Datos
- Migración `supabase/migrations/0006_push_subscriptions.sql`: tabla `push_subscriptions`
  (`id`, `user_id` default `auth.uid()`, `endpoint` único, `p256dh`, `auth`, `created_at`), RLS por dueño
  para select/insert/delete.
- `src/data/push.ts`: `saveSubscription(sub)` (upsert por endpoint), `deleteSubscription(endpoint)`.

### 3. Dominio (`src/domain/notification.ts`)
- `movementNotification({ direction, amountCents, currency, description })` → `{ title, body }`:
  "Ingreso"/"Gasto", monto formateado es-CR, descripción recortada a 60 caracteres. Probado.

### 4. UI (`src/ui/account/PushToggle.tsx`)
- Detecta soporte (`serviceWorker`, `PushManager`, `Notification`) y modo standalone para el aviso de iPhone.
- Activar: `Notification.requestPermission()` en el clic → `pushManager.subscribe({ userVisibleOnly, applicationServerKey })`
  con `VITE_VAPID_PUBLIC_KEY` → `saveSubscription`. Desactivar: `unsubscribe` + `deleteSubscription`.
- Toasts de éxito/error (UX-02jm).

### 5. Servidor (`supabase/functions/sync-bac-emails/`)
- Tras el upsert, usar las filas realmente insertadas (`select` devuelve solo nuevas por `ignoreDuplicates`).
- `push.ts`: con `npm:web-push` y secrets `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, enviar a cada
  suscripción del dueño; 404/410 → borrar la suscripción. Errores de push se registran y no fallan el sync.
- `ponytail:` sin outbox; si el envío falla tras guardar, esa notificación se pierde.

### 6. Pasos manuales del usuario
- Generar claves VAPID, `secrets set`, variable `VITE_VAPID_PUBLIC_KEY` en Vercel, `db push`, deploy de la función y de Vercel.
