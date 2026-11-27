# REC-03jm — El push de la tarjeta respeta "Ya pagué"
## Objetivo
El push del cron avisa el pago de la tarjeta con `dueOn` y no lee `card_paid_through`: si ya pagué por adelantado
me avisa igual, y si tengo una cuota atrasada no la incluye. La campana y el Resumen ya usan otro cálculo.
## Requisitos
- El push del 17 y del 20 dice el mismo "Pagas" que el Resumen: lo que vence hasta ese 20 y sigue sin marcar
  pagado (incluye lo atrasado), en CRC y USD por separado.
- Si ese 20 ya está marcado como pagado (o no queda nada por pagar), no se envía push.
- Sin marca guardada (usuario nuevo) se comporta por fecha, como el Resumen (TC-10jm AC-5).
## Restricciones
- Sin migración. Reutiliza `splitCredit`, `paidUntil` y `dueBy` de `src/domain/credit.ts`. CRC y USD nunca se suman.
- El reclamo atómico de `card_notified_on` no cambia.
## Criterios de aceptación
- AC-1: cuota ₡10 000 el 20 dic, `card_paid_through` = 20 dic, hoy 17 dic 9:00 CR → no hay push de tarjeta.
- AC-2: cuota ₡10 000 del 20 nov sin pagar + ₡5 000 el 20 dic, hoy 20 dic 9:00 → push con ₡15 000.
- AC-3: sin `card_paid_through`, cuota ₡10 000 el 20 dic, hoy 20 dic 9:00 → push con ₡10 000.
## Supuestos
- `dueOn` queda sin uso en el cron; se borra si nadie más lo usa.
- La Edge Function toma el cambio al redesplegarla (no se despliega aquí).
