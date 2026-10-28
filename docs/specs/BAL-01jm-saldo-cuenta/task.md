# BAL-01jm — Tareas

## Base acordada
spec.md + plan.md. Retroactivo: plan/task se escribieron después del código (desvío del flujo de `Claude.md`); se documenta con el commit real.

## Tareas
- [x] BAL-01jm-T01 Prueba: saldo desde la cuenta suma todo → `summarizeFromAccount` [src/domain/summary*]
  - `a9a9036`; 2 tests (rojo: función inexistente)
- [x] BAL-01jm-T02 Migración `account_balance` + `account_balance_at` [supabase/migrations/0004_account_balance.sql]
  - `a9a9036`; aplicada con `db push`
- [x] BAL-01jm-T03 `getSettings` + `saveAccountBalanceCents` [src/data/settings.ts] (depende de T02)
  - `a9a9036`
- [x] BAL-01jm-T04 `MoneySetting` genérico + `BalancePanel` + `App` [src/ui/balance/*, src/ui/App.tsx] (depende de T01, T03)
  - `a9a9036`; 36 tests, typecheck y build OK
- [ ] BAL-01jm-T05 Confirmar con el usuario si la tarjeta MASTER es de débito o de crédito (afecta AC-2)
