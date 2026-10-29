# TC-05jm — Productos en deuda, cuota mensual y total del 20
## Objetivo
En el card "Tarjeta de crédito" el dev ve el total de la deuda, pero no de qué productos viene ni cuánto paga el
próximo 20. Quiere ver cada producto con lo que le falta y, al cargar una deuda, poner la cuota que ya paga al mes.
## Requisitos
- El card lista cada compra con tarjeta que aún tiene cuotas por vencer: producto, lo que falta pagar, cuántas cuotas
  quedan y la próxima: "próxima ₡10 000 el 20 nov".
- El card muestra "Total a pagar el 20 <mes>": la suma de lo que vence el próximo día de pago (solo CRC).
- "Agregar deuda que ya tenías" suma "Cuánto pagas por mes (opcional)". Si se llena, las cuotas restantes son
  lo que queda ÷ cuota (redondeo hacia arriba, máximo 12); si no, se calcula con precio ÷ plazo como en TC-04jm.
## Restricciones
- Sin migraciones, tablas ni dependencias. Centavos enteros (`parseAmountToCents`); CRC y USD no se suman.
- Reutiliza `installmentDues`, `dueBy`, `nextPayDay` y el formulario de TC-04jm.
## Criterios de aceptación
- AC-1: hoy 29 oct, una tele con 6 cuotas de ₡10 000 pendientes → la lista muestra "Tele", ₡60 000 que faltan,
  6 cuotas y próxima de ₡10 000; las compras ya pagadas no salen.
- AC-2: tele (₡10 000 el 20 nov) + compra de un pago de ₡5 000 del 25 oct → "Total a pagar el 20 nov: ₡15 000".
- AC-3: queda ₡60 000 y paga ₡10 000 al mes → 6 cuotas de ₡10 000 desde el próximo 20, sin importar el plazo.
- AC-4: cuota mensual inválida (texto o 0) → error y no se guarda.
## Supuestos
- Si lo que queda no es múltiplo de la cuota, las cuotas se reparten iguales (resto en la primera), no "última más
  chica": diferencia menor a una cuota y la deuda total es exacta.
- El total del 20 es solo en colones; la deuda en dólares sigue aparte.
