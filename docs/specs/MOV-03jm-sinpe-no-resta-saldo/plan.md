# MOV-03jm — Plan
1. **`src/domain/summary.ts`** (`summaryFor`): antes de sumar, descarta los movimientos `out` con
   `paymentMethod === 'sinpe'`. El tipo de entrada suma `paymentMethod?` opcional (ya viene de `splitCredit`).
   Lo usan `DashboardView` y `mcp/tools.ts` (`puedo_comprar`), así que ambos quedan iguales con un solo cambio.
2. `monthStats`/`topExpenses`/`avgMonthlySpend` reciben `transactions` sin filtrar: el gasto sigue contando.
3. Tests en `src/domain/summary.test.ts` (AC-1..AC-3) y `monthStats.test.ts` (AC-4).
## Decisiones
- En `summaryFor` y no en `splitCredit`: `splitCredit` también arma la deuda de tarjeta; mezclar reglas confunde.
- Redeploy del MCP después del push para que `resumen_mes`/`puedo_comprar` usen la regla.
