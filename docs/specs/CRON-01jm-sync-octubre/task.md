# CRON-01jm — Tareas

## Base acordada
spec.md + plan.md. Retroactivo: el código se hizo antes de plan/task (desvío del flujo de `Claude.md`); se documenta con los commits reales.

## Tareas
- [x] CRON-01jm-T01 Rango octubre + paginación en la función [supabase/functions/sync-bac-emails/index.ts]
  - `b383e87`; `deno check` OK
- [x] CRON-01jm-T02 Migración: pg_cron, pg_net, secreto en Vault, RPC `is_valid_cron_secret`, job horario [supabase/migrations/0003_cron.sql]
  - `b383e87`
- [x] CRON-01jm-T03 Corrección: mantener verify_jwt, el cron envía publishable key [0003_cron.sql]
  - `b6bc504`; aplicada y desplegada
- [x] CRON-01jm-T04 Verificación: sin secreto / secreto falso → 401; corrida real → 55 leídos, 55 parseados, sin duplicados
  - curl + SQL Editor
