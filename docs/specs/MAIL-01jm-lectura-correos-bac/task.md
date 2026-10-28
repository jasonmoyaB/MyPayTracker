# MAIL-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. pnpm, Vitest.

## Tareas
- [x] MAIL-01jm-T01 Prueba: compra BAC CRC/USD no se parsea → `htmlToText` + `parseBacPurchase` [src/domain/bankEmail*.ts, __fixtures__]
  - 6 tests verdes (rojo: módulo inexistente)
- [x] MAIL-01jm-T02 Prueba: SINPE acreditado/rechazado → `parseBacSinpe` [src/domain/bankEmail*.ts, __fixtures__] (depende de T01)
  - 4 tests verdes (rojo: función inexistente)
- [x] MAIL-01jm-T03 Prueba: remitente decide el parser y payload Gmail base64url → `parseBankEmail` + `gmailBodyText` [src/domain/bankEmail*.ts] (depende de T02)
  - 6 tests verdes (rojo: funciones inexistentes)
- [x] MAIL-01jm-T04 Migración `currency` [supabase/migrations/0002_currency.sql]
  - aplicada al remoto con `db push`
- [x] MAIL-01jm-T05 Edge Function `sync-bac-emails` con upsert idempotente [supabase/functions/sync-bac-emails/index.ts] (depende de T03, T04)
  - `deno check` OK; desplegada con secrets OAuth; 1ª corrida: 8 leídos, 8 guardados, sin duplicados
