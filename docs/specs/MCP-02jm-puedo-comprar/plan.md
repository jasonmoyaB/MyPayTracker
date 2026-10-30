# MCP-02jm — Plan

## Módulos
1. **domain (`src/domain/summary.ts`)**: mover `summaryFor` desde `ui/dashboard/BalanceCard.tsx`
   (con un tipo de entrada estructural `{ account, salaryCents }`, sin importar `data/`). La UI la
   importa de domain: UI y MCP arman el saldo con la misma función (AC-1, sin deriva).
   `recommend.ts` pasa a imports con `.ts` para cargar en Deno.
2. **`supabase/functions/mcp/tools.ts`**: herramienta `puedo_comprar` { precio, plazo, extra? }.
   - Valida con `parseAmountToCents` y `PLANS` antes de consultar (AC-2). `plazo`: `"contado"` o
     1/3/6/10/12 (en el schema: enum).
   - Compone igual que `DashboardView`: `splitCredit(todos, now)` → `summaryFor(ajustes, settled)` →
     `recommend({ balanceCents, salaryCents, scheduleCrc: pending.scheduleCrc, spendCents:
     avgMonthlySpend(todos, now), ... })`. Sin resumen → mensaje de Cuenta (AC-3).
   - Salida: campos de `Recommendation` en español con montos `centsToNumeric`/`signed`.
   - Nueva dependencia inyectada `loadAll()` → `{ settings, transactions }`, para testear sin red.
3. **`supabase/functions/mcp/index.ts`**: `loadAll` lee `settings` (salary, account_balance,
   account_balance_at) y todas las transacciones con `installments`, con el cliente del usuario (RLS).
   Mismo techo de 1000 filas que `listTransactions` en la app.

## Decisiones
- Nada nuevo de dominio: solo se mueve `summaryFor` y se reutilizan `splitCredit`, `recommend` y
  `avgMonthlySpend`.
- El texto final lo redacta el asistente con los campos; `affordText` vive en ui y depende de su formato.
