# TC-05jm — Plan
## Dominio — `src/domain/credit.ts`
- `ongoingPurchase(priceCents, months, remainingCents, now, monthlyCents?)`:
  - Con `monthlyCents`: `installments = min(12, ceil(remaining / monthly))` (12 = tope del check de `0009`).
  - Sin él: igual que TC-04jm (`floor(precio / meses)`, tope el plazo). La fecha no cambia.
- `pendingPurchases(movements, now)`: por cada compra con tarjeta, sus cuotas de `installmentDues` aún no vencidas
  (mismo criterio que `splitCredit`: vence en o antes de `now` = pagada). Devuelve producto, moneda, lo que falta,
  cuántas cuotas quedan y la próxima. Las que no tienen cuotas pendientes no salen.
## UI
- `DebtForm`: campo "Cuánto pagas por mes (opcional)"; `checkDebt` devuelve `monthlyCents` (`null` si vacío) y
  da error si no es un monto válido. Se pasa a `ongoingPurchase`.
- `CreditCard`:
  - Línea "Total a pagar el <nextPayDay>: <dueBy(scheduleCrc, nextPayDay)>" cuando hay deuda en CRC.
  - Lista `<ul>` de `pendingPurchases`, que calcula `DashboardView` con `transactions` y pasa como prop.
## Decisiones
- La lista se deriva de las transacciones en cada render: no se guarda nada nuevo (ponytail).
- Cuotas iguales con resto en la primera, igual que `installmentDues`: no se agrega otro reparto.
## Pruebas
- `credit.test.ts`: AC-1 (`pendingPurchases`), AC-3 (`ongoingPurchase` con cuota).
- `DebtForm.test.tsx`: AC-4 en `checkDebt`; el card muestra la lista y el total (AC-1, AC-2).
