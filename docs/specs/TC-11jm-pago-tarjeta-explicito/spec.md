# TC-11jm — "Pago de tarjeta" como forma de pago
## Objetivo
Hoy un pago de tarjeta se reconoce por palabras en la descripción ("tarjeta", "visa", "crédito"…). Un gasto normal
con esas palabras sale de los gastos del mes por error. Quiero marcarlo yo de forma explícita.
## Requisitos
- Al registrar un gasto a mano puedo elegir la forma de pago "Pago de tarjeta".
- Un "Pago de tarjeta" no cuenta en los gastos del mes, en "Top gastos", en el gasto típico de "¿Puedo comprar
  esto?" ni en el saldo disponible: es el mismo dinero de las cuotas que ya se restan.
- Un gasto manual de otra forma de pago cuenta siempre, aunque diga "visa" o "tarjeta".
- Los movimientos de correo (BAC) siguen reconociéndose por palabras, porque no traen forma de pago.
- En Movimientos el pago se ve con su etiqueta "Pago de tarjeta".
## Restricciones
- Migración nueva `0014`: agrega el valor al check de `payment_method`; solo gasto y en un pago (`installments = 1`).
- El regex sigue en los recordatorios (no son movimientos). Centavos; CRC y USD intactos.
## Criterios de aceptación
- AC-1: gasto manual ₡5 000 "Super Visa" en efectivo → cuenta en gastos del mes.
- AC-2: gasto manual ₡50 000 "Pago" con forma "Pago de tarjeta" → no cuenta en gastos del mes ni baja el saldo.
- AC-3: gasto de correo "PAGO TARJETA BAC" → no cuenta en gastos del mes (como hoy).
- AC-4: la BD rechaza "Pago de tarjeta" como ingreso o con cuotas.
## Supuestos
- No marca "Ya pagué" solo: eso sigue siendo el botón de TC-10jm.
- El saldo con correos BAC de pago de tarjeta no cambia (como hoy) para no mover saldos ya cuadrados.
