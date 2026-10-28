# BAL-01jm — Saldo actual de la cuenta BAC

## Problema
El saldo disponible sumaba salario + todos los movimientos guardados y no coincidía con la cuenta real (₡235 000 vs ₡140 000).

## Objetivo
Registrar el saldo real de la cuenta en un momento y calcular desde ahí.

## Criterios de aceptación
- AC-1: input "Saldo actual en BAC"; al guardar se registran monto y fecha/hora actual.
- AC-2: con saldo de cuenta: disponible = saldo + ingresos CRC − gastos CRC con `occurredAt` posterior a esa fecha.
- AC-3: sin saldo de cuenta: se mantiene salario + movimientos.
- AC-4: con saldo de cuenta, el salario se muestra pero no se suma, y la UI lo dice.

## Supuestos
- Las compras con tarjeta MASTER se restan al saldo de la cuenta. Si es tarjeta de crédito, en realidad se cobran al pagar la tarjeta; queda para otra spec.
- Editar el saldo vuelve a fijar la fecha a "ahora".
