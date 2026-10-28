# BAL-01jm — Plan

## Referencias
`docs/specs/UI-01jm-vistas/`; `src/domain/summary.ts`; `src/data/settings.ts`; `src/ui/balance/*`.

## Enfoque
Un "ancla": el monto real de la cuenta más el instante en que se registró.
Todo lo anterior ya está dentro del monto; solo cuenta lo posterior.
Se reutiliza `summarize` para no duplicar el cálculo.

## Diseño
- **BD**: `settings.account_balance numeric(12,2)` + `account_balance_at timestamptz`.
  - Un check exige que ambos sean null o ninguno.
- **domain**: `summarizeFromAccount(cents, asOf, movements)` filtra los movimientos con `occurredAt` posterior a `asOf` y llama `summarize`.
  - Compara instantes con `Date.parse`, no texto, para que las zonas horarias distintas no rompan la comparación.
- **data**: `getSettings()` devuelve `{ salaryCents, account }`.
  - `saveAccountBalanceCents` guarda el monto con `now()`.
  - Un `upsertSettings` compartido evita repetir la lógica de sesión y upsert.
- **ui**: `SalarySection` se generaliza a `MoneySetting` (label, ayuda, nota, save) y se usa dos veces, para saldo de cuenta y salario.
  - `BalancePanel` elige el cálculo: con ancla, desde la cuenta; si no, desde el salario.
  - `App` pasa `settings` en vez de `salaryCents`.

## Estructura
| Archivo | Capa | Responsabilidad |
|---|---|---|
| `supabase/migrations/0004_account_balance.sql` | BD | columnas + check |
| `src/domain/summary.ts` | domain | `summarizeFromAccount` |
| `src/data/settings.ts` | data | leer/guardar salario y ancla |
| `src/ui/balance/MoneySetting.tsx` | ui | editar un monto en colones |
| `src/ui/balance/BalancePanel.tsx`, `src/ui/App.tsx` | ui | elegir el cálculo y pasar settings |

## Pruebas
- `summarizeFromAccount`: solo suma lo posterior; misma hora en otra zona no cuenta como posterior.
- Suite completa, typecheck y build.
