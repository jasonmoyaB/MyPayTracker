# PRES-01jm — Plan
## Migración `00NN_budgets.sql`
- `budgets(user_id uuid default auth.uid() references auth.users on delete cascade, category text check (lista),
  amount numeric(12,2) check (> 0), warned_month text, exceeded_month text, primary key (user_id, category))`.
- RLS: el dueño lee, crea, actualiza `amount` y borra; los marcadores los escribe el cron (service_role).
## Domain (`src/domain/budget.ts`, imports `.ts`)
- `budgetStatus(budgets, movements, now)`: por categoría `{ spentCents, limitCents, percent }` con
  `monthlyCharges` + `categoryOf` + mes CR (`costaRicaMonth`). Solo gastos CRC.
- `budgetAlert(status)`: `'warn' | 'exceeded' | null` y el texto del push.
## Data (`src/data/budgets.ts`)
- `listBudgets`, `saveBudget(category, cents)` (upsert), `deleteBudget(category)`.
## UI
- Opciones: formulario simple por categoría (select + monto con `parseAmountToCents`) y lista con quitar.
- Resumen: `BudgetCard` con barra (`<progress>` nativo + texto).
## Sync (`supabase/functions/sync-bac-emails/`)
- `budgets.ts`: lee budgets + transacciones del dueño (paginado, ARQ-02jm), calcula `budgetStatus`, reclama
  `warned_month`/`exceeded_month` = mes CR con update condicional, y envía con `pushToOwner`. Nunca rompe el sync.
- `index.ts` lo llama después de insertar los movimientos nuevos.
## Pruebas
- `budget.test.ts`: AC-1, AC-3, porcentajes y mes CR.
- `budgets.test.ts` (sync): AC-2, AC-4 con mock de `db`.
- Test de UI: AC-5.
## Riesgos
- El cron calcula con todos los movimientos en cada pasada (cada 5 min): aceptable con un dueño.
