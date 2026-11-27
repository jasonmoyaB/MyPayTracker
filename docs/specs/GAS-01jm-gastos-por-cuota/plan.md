# GAS-01jm — Plan
## Domain (`src/domain/monthStats.ts`)
- Nueva `monthlyCharges(movements)`: devuelve los movimientos como se pagan.
  - Compra con tarjeta → una fila por cuota con `installmentDues` (`credit.ts`), fechada en su 20 y con el monto de la cuota.
  - Gasto de pago de tarjeta (`isCardPayment`, el mismo criterio de `avgMonthlySpend`) → fuera.
  - Lo demás → igual.
- `monthStats`, `topExpenses` y `filterTotals` no cambian: reciben la salida de `monthlyCharges`.
- La regla de corte (6) y pago (20) sigue solo en `credit.ts` (`creditDueAt`): no se duplica.
## UI
- `DashboardView`: `MonthCards` y `TopExpenses` reciben `monthlyCharges(transactions)`.
- `TransactionsPanel`: `filterTotals(applyFilter(monthlyCharges(transactions), filter))`; la lista sigue con `shown`.
## MCP (`supabase/functions/mcp/tools.ts`)
- `resumen_mes` lee con `ledger()` (todos los movimientos, con `installments`) en vez de `query` del mes:
  las cuotas de un mes vienen de compras de hasta 12 meses antes, que la query del mes no trae.
## Pruebas
- `monthStats.test.ts`: AC-1, AC-2, AC-3 con `monthlyCharges` + `monthStats`.
- `tools.test.ts`: `resumen_mes` cuenta la cuota de una compra de un mes anterior (AC-4).
- Tests de UI existentes siguen pasando.
## Riesgos
- `isCardPayment` busca palabras como "visa" o "tarjeta": un gasto normal con esa palabra saldría de los gastos del mes,
  igual que ya pasa en el gasto típico de "¿Puedo comprar esto?".
