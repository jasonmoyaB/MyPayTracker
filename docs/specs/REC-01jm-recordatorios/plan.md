# REC-01jm — Plan
## Migración `0010_reminders.sql`
- `reminders`: id, `user_id` default `auth.uid()` (FK auth.users, cascade), description, amount numeric(12,2) > 0,
  currency CRC|USD, day smallint 1–31, `notified_on date` (último día CR con aviso), created_at; índice por user_id.
- RLS: select/insert/delete del dueño (sin update desde el cliente; el aviso lo marca service_role).
- `settings.card_notified_on date`: mismo marcador para el aviso de la tarjeta.
## Dominio
- `src/domain/reminder.ts` (puro, importable desde Deno con extensión `.ts` como `notification.ts`):
  - `nextDueOn(day, now)`: próxima fecha CR (hoy incluido) con el día recortado al fin de mes.
  - `reminderPhase(dueOn, now)`: `'hoy' | 'pronto' | null` (pronto = faltan 3 días; solo desde las 8:00 CR).
  - `reminderNotification({ description, amountCents, currency, phase })` → `{ title, body, url: '/#/recordatorios' }`.
- `src/domain/credit.ts`: `dueOn(movements, dueAt)` = CRC y USD de las cuotas (`installmentDues`) con ese `dueAt`.
  No usa `splitCredit`, que el mismo 20 ya las da por pagadas.
## Datos — `src/data/reminders.ts`
- `listReminders`, `addReminder`, `deleteReminder` con `centsToNumeric`/`numericToCents`; RLS filtra.
## UI
- `route.ts` + `AppShell` (pestaña con ícono de campana) + `App.tsx` (rama `Screen`, carga con los datos existentes).
- `src/ui/reminders/RemindersView.tsx`: fila de tarjeta (`dueOn` en `nextPayDay`), lista con próxima fecha y botón
  Borrar, formulario (descripción, monto con `parseAmountToCents`, moneda, día) con `saveWithToast`.
## Edge Function `sync-bac-emails`
- `reminders.ts`: `notifyReminders(db, ownerId, now, sender)`; corre antes del sync de Gmail en su propio try.
  - Por recordatorio con fase: reclamo atómico `update ... set notified_on = hoy where id = X and notified_on
    is distinct from hoy returning id`; solo si devuelve fila, envía. Tarjeta: igual sobre `settings.card_notified_on`.
  - Reutiliza `webPushSender` y el borrado de suscripciones 404/410 de `push.ts`.
- `public/sw.js`: abre `payload.url` si empieza con `/#/`; si no, Movimientos.
## Decisiones
- Un marcador por fecha, no por fase: 3 días antes y el día son fechas distintas, basta `notified_on = hoy`.
- Sin cron nuevo: la función ya corre cada 5 minutos.
## Despliegue (lo hace el dev)
`db push` de 0010 y redeploy de `sync-bac-emails` y del front (service worker).
