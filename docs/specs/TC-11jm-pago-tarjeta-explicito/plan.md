# TC-11jm — Plan
## Migración `0014_payment_method_card_payment.sql`
- Reemplaza el check de `payment_method` por uno con `card_payment` (nombre real del constraint en 0012).
- Check nuevo: `payment_method <> 'card_payment' or (direction = 'out' and installments = 1)`.
## Domain
- `PaymentMethod` (`credit.ts`) suma `'card_payment'`; como `sinpe`, no es `credit` y se liquida en su fecha.
- Nueva `isCardPaymentMovement(m)` en `monthStats.ts`: `paymentMethod === 'card_payment'` o
  (`source` empieza por `email_` y `isCardPayment(description)`).
- `monthlyCharges` y `avgMonthlySpend` usan `isCardPaymentMovement` en vez del regex suelto.
- Saldo: se dejan fuera solo los `card_payment` explícitos, en el punto común que usan app y MCP (`summaryFor`).
## Data / UI
- `TransactionForm`: opción "Pago de tarjeta" solo en gasto; oculta el plazo.
- Etiqueta en la fila de Movimientos (donde hoy se muestra SINPE/tarjeta).
- MCP: si mapea `payment_method`, acepta el valor nuevo sin romper tipos.
## Pruebas
- `monthStats.test.ts`: AC-1, AC-2 (gastos), AC-3.
- `summary.test.ts`: AC-2 (saldo no baja).
- AC-4 vive en el check de la migración (no hay tests de SQL en el repo).
## Riesgos
- `effectivePaymentMethod` fuerza el método por dirección: un ingreso nunca debe quedar `card_payment`.
