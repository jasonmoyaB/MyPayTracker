# REC-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de REC-01jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] REC-02jm-T01 Prueba + `nextDueOn` con `paidOn` [src/domain/reminder.ts] (AC-1..3)
  - Evidencia: rojo 2 fallos (AC-2 y AC-3 daban el 1 nov); verde reminder.test.ts 14/14; typecheck OK.
- [x] REC-02jm-T02 Migración 0011 + `paidOn` y `markReminderPaid` en data [supabase/migrations, src/data/reminders.ts]
  - Evidencia: rojo ENOENT 0011 y sin markReminderPaid; verde reminders.test.ts 9/9; typecheck OK.
- [x] REC-02jm-T03 Prueba + botón "Pagado" y campana/Edge Function con `paidOn` [src/ui/reminders/*, supabase/functions/sync-bac-emails/reminders.ts] (AC-2)
  - Evidencia: rojo 3 fallos (campana, push y botón); verde 373/373; typecheck y build OK. Falta `db push` 0011 + redeploy función y front.
