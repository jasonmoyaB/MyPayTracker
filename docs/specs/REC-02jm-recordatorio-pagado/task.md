# REC-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de REC-01jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] REC-02jm-T01 Prueba + `nextDueOn` con `paidOn` [src/domain/reminder.ts] (AC-1..3)
  - Evidencia: rojo 2 fallos (AC-2 y AC-3 daban el 1 nov); verde reminder.test.ts 15/15; typecheck OK.
- [ ] REC-02jm-T02 Migración 0011 + `paidOn` y `markReminderPaid` en data [supabase/migrations, src/data/reminders.ts]
- [ ] REC-02jm-T03 Prueba + botón "Pagado" y campana/Edge Function con `paidOn` [src/ui/reminders/*, supabase/functions/sync-bac-emails/reminders.ts] (AC-2)
