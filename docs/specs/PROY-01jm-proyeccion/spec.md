# PROY-01jm — ¿Con cuánto llego a fin de mes?
## Objetivo
"Puedes gastar" dice lo que tengo hoy, pero no cuánto me va a quedar el último día del mes si sigo gastando como siempre.
## Requisitos
- En el Resumen, una tarjeta "Fin de mes" muestra cuánto me quedaría el último día del mes (hora CR).
- Proyección = saldo disponible hoy − cuotas de tarjeta sin pagar que vencen de hoy a fin de mes − gastos fijos
  apartados (FIJ-01jm) − lo que falta del gasto típico del mes.
- Lo que falta del gasto típico = gasto típico (el de "¿Puedo comprar esto?") − lo ya gastado este mes sin
  tarjeta ni pagos de tarjeta, nunca menos de 0.
- La tarjeta dice el desglose en texto (cada resta con su monto) y si da negativo lo marca como alerta.
## Restricciones
- Cálculo puro en domain; reutiliza `avgMonthlySpend`, `splitCredit`, `dueBy` y `reservedCents`. Solo CRC.
- No suma el salario: no se sabe qué día entra; los ingresos reales entran por correo.
## Criterios de aceptación
- AC-1: saldo ₡300 000, cuota ₡16 166 el 20 sin pagar, fijos ₡50 000, típico ₡120 000, gastado ₡70 000
  → ₡183 834 (300 000 − 16 166 − 50 000 − 50 000).
- AC-2: gastado ₡150 000 > típico ₡120 000 → lo que falta del típico es ₡0.
- AC-3: resultado negativo → se muestra con signo menos y estilo de alerta (texto, no solo color).
- AC-4: sin saldo ni salario → no se muestra la tarjeta.
## Supuestos
- Sin historial (típico ₡0) la proyección solo resta lo comprometido.
- Si el 20 ya pasó este mes, solo cuentan las cuotas atrasadas sin pagar (lo que diga `dueBy` hasta fin de mes).
