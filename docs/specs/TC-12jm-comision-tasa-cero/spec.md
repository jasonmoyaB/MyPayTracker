# TC-12jm — Comisión de la tasa cero
## Objetivo
BAC puede cobrar una comisión por pasar una compra a tasa cero. Hoy las cuotas se calculan solo con el precio y
salen más bajas que lo que de verdad cobra el banco.
## Requisitos
- Al registrar una compra con tarjeta a plazo (más de 1 cuota) puedo escribir una comisión opcional.
- La comisión se suma al monto de la compra y se reparte en las cuotas igual que el precio.
- Deuda, "Pagas el 20", gastos del mes y "¿Puedo comprar esto?" incluyen la comisión.
- Sin comisión todo queda igual que hoy.
## Restricciones
- Sin migración: el monto guardado ya es el total que se paga. Centavos con `parseAmountToCents`; misma moneda
  que la compra.
## Criterios de aceptación
- AC-1: compra ₡120 000 a 12 meses con comisión ₡6 000 → se guarda ₡126 000 y la cuota es ₡10 500.
- AC-2: comisión vacía → se guarda el precio tal cual.
- AC-3: comisión inválida (negativa o texto) → error en el formulario y no se guarda.
- AC-4: en un pago (1 cuota) o sin tarjeta no se muestra el campo.
## Supuestos
- BAC reparte la comisión en las cuotas; si la cobrara aparte en el primer pago, se registra como gasto aparte.
- La comisión no se guarda por separado: el detalle muestra el total (precio + comisión).
- Comisión "0" equivale a vacía. Va en `parseFeeToCents` (domain) y no en el hook: sin DOM en los tests, así se prueba AC-1..AC-3.
