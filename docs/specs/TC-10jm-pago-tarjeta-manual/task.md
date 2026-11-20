# TC-10jm — Tareas

- [x] TC-10jm-T01 (db) migración `0013_card_paid_through.sql` con columna y backfill (sin aplicar al remoto).
- [x] TC-10jm-T02 (domain) `paidUntil`; `splitCredit` y `pendingPurchases` cortan por `paidThrough`; tests AC-1, AC-3, AC-5.
- [x] TC-10jm-T03 (data) `cardPaidThrough` en `getSettings` y `saveCardPaidThrough`.
- [x] TC-10jm-T04 (ui) Resumen: `paidUntil` en `DashboardView` + `CardPaidButton` con confirm; test AC-1/AC-2 por render.
- [x] TC-10jm-T05 (ui) Recordatorios, `CardDebtDialog` y campana con el mismo `pending` que el Resumen + "Ya pagué"; test AC-4.
- [x] TC-10jm-T06 (functions) MCP lee `card_paid_through` y usa `paidUntil` en `puedo_comprar`; `deno check`.
