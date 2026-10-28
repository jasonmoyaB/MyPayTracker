# CRON-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta.

## Tareas
- [x] CRON-02jm-T01 Rango sin fin + saltar ids ya guardados + `skipped` en respuesta [supabase/functions/sync-bac-emails/index.ts] (AC-1, AC-2)
- [x] CRON-02jm-T02 Migración horario cada 5 min [supabase/migrations/0005_cron_5min.sql] (AC-3)
- [x] CRON-02jm-T03 Prueba + recarga cada 60 s visible y al volver a la pestaña [src/ui/App.tsx] (AC-4, AC-5)
- [x] CRON-02jm-T04 Deploy función, `db push` (dry-run antes), deploy Vercel; verificar respuesta del sync (AC-6) (depende de T01–T03)
  - función, `0005` y Vercel desplegados; `net._http_response` → 200 (verificado por el usuario)
