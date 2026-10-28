# UI-01jm — Tareas

## Base acordada
spec.md + plan.md. Retroactivo: plan/task se escribieron después del código (desvío del flujo de `Claude.md`); se documenta con los commits reales.

## Tareas
- [x] UI-01jm-T01 Base: capa data, `money.ts` (TDD), tema, shell con sesión, stubs [src/data/*, src/domain/money*, src/ui/*]
  - `1be4979`
- [x] UI-01jm-T02 Prueba: monto escrito no se convierte → `parseAmountToCents` [src/domain/amount*]
  - `0efa30b`; 2 tests
- [x] UI-01jm-T03 Login (worker A) [src/ui/auth/LoginView.tsx]
  - `f2d5993`; revisado por coordinador
- [x] UI-01jm-T04 Saldo, compra y salario + `summarize` (TDD) (worker B) [src/ui/balance/*, src/domain/summary*]
  - `7f3f67a`; revisado por coordinador
- [x] UI-01jm-T05 Movimientos y registro manual + `date.ts` (TDD) (worker C) [src/ui/transactions/*, src/domain/date*]
  - `13c1b25`; 34 tests, typecheck y build OK
