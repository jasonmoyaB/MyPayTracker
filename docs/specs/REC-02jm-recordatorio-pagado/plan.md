# REC-02jm — Plan
## Datos
- `0011_reminders_paid.sql`: columna `reminders.paid_on date` (fecha CR del vencimiento pagado).
- Policy de update del dueño + privilegio de columna: `authenticated` solo puede hacer update de `paid_on`
  (no de monto, día ni `notified_on`).
- `src/data/reminders.ts`: `paidOn` en `Reminder` y `markReminderPaid(id, dueOn)`.
## Dominio
- `nextDueOn(day, now, paidOn?)`: si `paidOn` ≥ el vencimiento calculado, devuelve el siguiente.
  Una sola regla; todos los que ya llaman `nextDueOn` (lista, campana, Edge Function) quedan bien solos.
## UI
- `RemindersList`: botón "Pagado" junto a "Borrar", con el mismo bloqueo contra doble toque; recarga al terminar.
- `NotificationBell` pasa `paidOn`.
## Edge Function
- `dueReminders` lee `paid_on` y lo pasa a `nextDueOn`. Requiere redeploy.
## Pruebas
- reminder.test.ts (AC-1..3), RemindersView.test.tsx (botón), NotificationBell.test.tsx (no avisa pagado).
## Despliegue
- `db push` de 0011 antes del front (sin la columna, el select falla y solo cae la pantalla Recordatorios).
