# BAL-01jm — Saldo actual de la cuenta BAC

## Problema
El saldo disponible sumaba salario + todos los movimientos guardados y no coincidía con la cuenta real (₡235 000 en la app vs ₡140 000 en BAC).

## Objetivo
Partir del saldo real de la cuenta en un momento dado y calcular desde ahí.

## Requisitos de usuario
- Escribir cuánto tengo hoy en mi cuenta BAC.
- Que el saldo disponible no vuelva a contar movimientos que ya están reflejados en ese monto.

## Criterios de aceptación
- AC-1: campo "Saldo actual en BAC"; al guardarlo se registran el monto y la fecha y hora en que se guardó.
- AC-2: con saldo de cuenta, disponible = ese saldo + ingresos − gastos en colones ocurridos después de esa fecha y hora.
- AC-3: sin saldo de cuenta, se mantiene el cálculo anterior (salario + movimientos).
- AC-4: con saldo de cuenta, el salario se muestra pero no se suma, y la pantalla lo dice.
- AC-5: editar el saldo de cuenta vuelve a fijar la fecha a "ahora".

## Fuera de alcance
Historial de saldos, conciliación automática con el estado de cuenta.

## Supuestos
- Las compras con tarjeta MASTER restan del saldo de la cuenta. Si es tarjeta de crédito, en realidad se cobran al pagarla; pendiente de confirmar con el usuario.
