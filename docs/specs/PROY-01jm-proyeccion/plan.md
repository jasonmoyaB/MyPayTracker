# PROY-01jm — Plan
## Domain (`src/domain/projection.ts`, imports `.ts`)
- `monthEndProjection({ availableCents, scheduleCrc, reservedCents, typicalCents, spentCents, now })` →
  `{ cardCents, reservedCents, remainingTypicalCents, endCents }`.
  - `cardCents = dueBy(scheduleCrc, finDeMes)` con fin de mes = `costaRicaMonth(now).endMs − 1`.
  - `remainingTypicalCents = max(0, typicalCents − spentCents)`.
- `spentCents`: gastos CRC de este mes sin tarjeta ni pagos de tarjeta; helper en `monthStats.ts` que reutiliza
  el mismo filtro de `avgMonthlySpend` (extraer el predicado para no duplicarlo).
## UI
- `DashboardView` arma los datos que ya tiene (summary, pending.scheduleCrc, reserva de FIJ-01jm, avgMonthlySpend)
  y pinta `ProjectionCard` (nuevo, en `src/ui/dashboard/`) con el desglose en `<dl>`.
- Negativo: clase `expense` + texto "Te faltarían".
## Pruebas
- `projection.test.ts`: AC-1, AC-2, fin de mes CR.
- `DashboardView.test.tsx`: AC-3 (texto de alerta) y AC-4.
## Riesgos
- Doble resta: `availableCents` ya es el saldo sin cuotas pendientes; las cuotas se restan una sola vez aquí.
  "Puedes gastar" resta solo el próximo 20; aquí se resta hasta fin de mes, que puede ser el mismo 20.
- Depende de FIJ-01jm (`reservedCents`); si no está, se pasa 0.
