# TC-10jm — Plan
## 1. Migración `0013_card_paid_through.sql`
- `settings.card_paid_through timestamptz`: el 20 hasta el que el dev confirmó pago (00:00 CR, guardado en UTC).
- Backfill de filas existentes: el último 20 estrictamente anterior a la fecha CR de hoy, a las 06:00 UTC.
- La RLS "for all" de `settings` ya cubre el update del dueño.
## 2. Domain (`src/domain/credit.ts`)
- `splitCredit` y `pendingPurchases` dejan de cortar por `now`: reciben `paidThrough: Date` (hasta dónde está pagado).
- `paidUntil(cardPaidThrough: string | null | undefined, now)`: sin marca → `now` (comportamiento de hoy, AC-5); con marca → esa fecha.
- La cuota vencida sin pagar queda en `pending` con su fecha vieja; `dueBy(schedule, nextPayDay(now))` ya la suma (AC-3) y `recommend` la reserva sin cambios.
- `dueOn` deja de usarse en la app (campana y Recordatorios usan `pending`); queda solo para el cron.
## 3. Data (`src/data/settings.ts`)
- `Settings.cardPaidThrough?: string | null` (opcional para no romper fixtures); `getSettings` lo lee.
- `saveCardPaidThrough(dueAt)` vía `upsertSettings`.
## 4. UI
- `DashboardView`, `CardDebtDialog`, `RemindersList` y `bellItems` llaman a `splitCredit`/`pendingPurchases` con `paidUntil(cardPaidThrough, now)`.
- `App` pasa `cardPaidThrough` (y `reload`) a `RemindersView` y `NotificationBell`.
- `CardPaidButton` (exportado de `CreditCard.tsx`): visible si `pending.dueAt <= nextPayDay(now)`; `confirm()` con fecha y monto de ese día; `saveWithToast(saveCardPaidThrough(pending.dueAt))` y recarga.
- Fila de tarjeta en Recordatorios: "Pagas {dueBy} el {20} · Deuda total {crc}" (USD aparte) + "Ya pagué".
## 5. MCP (`supabase/functions/mcp/`)
- `index.ts` lee `card_paid_through` en `ledger`; `tools.ts` usa `paidUntil` en `puedo_comprar`. `deno check`.
## Decisiones
- Una columna y no una tabla de pagos: el dev paga el ciclo completo (supuesto de la spec).
- La cuota pagada sigue fechada en su `dueAt` como gasto (TC-01jm); `summary.ts` no cambia.
