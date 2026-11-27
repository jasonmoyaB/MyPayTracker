# REC-03jm — Plan
## Domain
- Nada nuevo: `splitCredit(movs, paidUntil(cardPaidThrough, now))` da `pending.scheduleCrc/scheduleUsd`;
  `dueBy(schedule, payDay)` da lo que se paga ese 20 con lo atrasado (igual que `DashboardView` y `NotificationBell`).
- Si nadie más usa `dueOn` en `credit.ts`, se borra con su test.
## Sync (`supabase/functions/sync-bac-emails/reminders.ts`)
- `dueCard` lee `settings.card_paid_through` del dueño (service_role: filtra por `user_id` a mano).
- Arma los movimientos de tarjeta como hoy y calcula con `splitCredit` + `dueBy` en vez de `dueOn`.
- Si CRC y USD dan 0 → sin aviso (ya pagado o sin deuda).
- El resto (fase, reclamo, envío) igual.
## Pruebas
- `reminders.test.ts`: AC-1, AC-2, AC-3 con el mock de `db` existente (agregar la lectura de `settings`).
## Riesgos
- El mock de `db` distingue tablas por nombre: devolver `settings` sin romper los otros casos.
- Si ARQ-02jm ya cambió `dueCard` a `allPages`, se conserva.
