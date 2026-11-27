# BAL-02jm — Plan
## Domain
- `reconcileText(appCents, bacCents)` en `src/domain/summary.ts` (o archivo vecino): devuelve el texto de AC-1..AC-3
  con `formatAmount` de `notification.ts` (ya formatea colones).
## UI
- `AccountView` recibe `transactions` (de `App`/`AppShell`, igual que Resumen) y arma el saldo como `DashboardView`:
  `summaryFor(settings, splitCredit(transactions, paidUntil(settings.cardPaidThrough, now)).settled)`.
- Muestra "La app calcula hoy: ₡X" si hay resumen (AC-4).
- `MoneySetting` del saldo: el `successMessage` del guardado pasa a incluir `reconcileText(app, nuevo)`.
  Si `MoneySetting` solo acepta texto fijo, se le permite recibir una función `(cents) => string`.
## Pruebas
- `summary.test.ts`: AC-1, AC-2, AC-3.
- `AccountView.test.tsx`: muestra la cifra de la app y la oculta sin datos (AC-4).
## Riesgos
- Duplicar en `AccountView` el armado del saldo de `DashboardView`: si crece, extraer un helper domain común
  (`availableNow(settings, transactions, now)`); con dos usos se extrae de una vez.
