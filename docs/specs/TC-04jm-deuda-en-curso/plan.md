# TC-04jm — Plan
## Migración `0009_installments_restantes.sql`
- Reemplaza el check `transactions_installments_check` (1|3|6|10|12) por `installments between 1 and 12`:
  lo que queda de un plazo puede ser 1–12 cuotas. `transactions_cuotas_solo_tarjeta` no cambia. RLS no cambia.
- `0008` no se edita (ya aplicada).
## Dominio — `src/domain/credit.ts`
- `ongoingPurchase(priceCents, months, remainingCents, now)` → `{ installments, occurredAt }`:
  - `installments = min(months, ceil(remaining / floor(price / months)))`.
  - `occurredAt` tal que `creditDueAt(occurredAt) === nextPayDay(now)`: si hoy (CR) está después del corte y
    hasta el 20, el día de corte de este mes a las 00:00 CR (`crDay`); si no, `now`.
  - Así `installmentDues` y `splitCredit` reparten `remaining` sin cambios.
- La validación de "queda > precio" va en la UI junto al resto de errores del formulario.
## Datos
- Sin cambios: se reutiliza `addManualTransaction` con `paymentMethod: 'credit'`, `currency: 'CRC'`,
  `direction: 'out'`, `amountCents = remaining`, `description = producto`.
## UI
- `src/ui/dashboard/DebtForm.tsx` (nuevo): `<details>` nativo con el formulario; estado local, `saveWithToast`,
  bloqueo de doble envío, mensajes `role="alert"`. Opciones de plazo con `PLANS` y `planLabel` existentes.
- `CreditCard` recibe `onSaved` y monta `DebtForm`. `DashboardView` recibe `reload` y lo pasa; `App` lo entrega.
## Decisiones
- Una compra con tarjeta más, no una tabla de deudas: reutiliza toda la agenda de cuotas (ponytail).
- Primera cuota = `nextPayDay`, no `creditDueAt(hoy)`: entre el 7 y el 20 la cuota del estado de cuenta ya cerrado
  vence este 20; usar el del mes siguiente inflaría "Puedes gastar".
## Pruebas
- `credit.test.ts`: AC-1 a AC-4 (cuotas y fechas con `installmentDues`).
- `transactions.test.ts`: migración leída del disco con el nuevo check.
- `DashboardView.test.tsx` / prueba del form: el card muestra el formulario; AC-5 con la validación.
## Despliegue
`db push` de 0009 (lo hace el dev) antes de desplegar la web.
