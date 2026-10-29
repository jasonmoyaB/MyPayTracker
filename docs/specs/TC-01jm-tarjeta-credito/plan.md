# TC-01jm — Plan

## Regla central
Una compra con tarjeta es un gasto cuya fecha efectiva es su día de pago, no el día de compra.
- Antes de esa fecha es deuda pendiente.
- Desde esa fecha entra al saldo como gasto con `occurredAt = fecha de pago`.

Así el ancla de saldo de cuenta de BAL-01jm sigue funcionando sin cambios: si el ancla es posterior
al pago, la compra ya está dentro del saldo del banco y no se resta otra vez.

## Módulos
- **Migración `supabase/migrations/0007_payment_method.sql`**
  - Agrega a `transactions` la columna `payment_method text not null default 'cash'`.
  - Valores posibles: `cash`, `credit`.
  - Check: `credit` solo con `direction = 'out'`.
  - Las filas existentes y las del cron quedan en `cash`. RLS no cambia.
- **Dominio `src/domain/credit.ts`** (puro, con pruebas)
  - Constantes: `CUT_DAY = 6`, `DUE_DAY = 20`.
  - `creditDueAt(occurredAt)`: fecha de pago (20 a las 00:00 CR), calculada con `CR_OFFSET_MS` de `date.ts`.
  - `nextCreditDates(now)`: próximo corte y próximo pago desde hoy.
  - `splitCredit(movements, now)` devuelve dos cosas:
    - `settled`: movimientos para el saldo. Los de tarjeta ya vencidos entran con `occurredAt` = pago; los pendientes salen.
    - `pending`: deuda pendiente, con totales CRC y USD por separado.
- **Datos `src/data/transactions.ts`**
  - `Transaction` y `NewTransaction` ganan `paymentMethod: 'cash' | 'credit'`.
  - `listTransactions` lee la columna; `addManualTransaction` la escribe.
- **UI de movimientos**
  - Formulario: select "Método de pago", solo para gastos. Si el tipo es ingreso se guarda efectivo (se deriva al guardar).
  - Fila: "Tarjeta · se paga el …".
- **UI del Resumen**
  - `summaryFor` aplica `splitCredit` antes de resumir.
  - `CreditCard` nueva muestra corte, pago, deuda y límite, o el aviso de quiebra.
  - `AffordCheck` recibe el límite.

## Decisiones
- No hay tabla de pagos ni estado "pagada": la fecha de pago decide. Es menos código y cuadra con el ancla.
- El límite solo considera CRC; la deuda en USD se muestra aparte, igual que el resumen actual.
- Sin config de días: una sola tarjeta y valores que no cambian (ponytail).

## Pruebas
- `credit.test.ts`: AC-1, AC-2, AC-3 y AC-5 (ancla), además del borde de 23:59 CR del día 6.
- Migración leída del disco, como en `push.test.ts`.
- Datos: inserta y lee `payment_method`.
- UI con `renderToStaticMarkup`: aviso de quiebra, select en el formulario y etiqueta en la fila.

## Despliegue
`db push` de 0007 **antes** de desplegar la web: el select de `payment_method` falla sin la columna.
