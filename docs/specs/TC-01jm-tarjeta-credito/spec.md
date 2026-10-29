# TC-01jm — Compras con tarjeta de crédito y límite para no quebrar
## Objetivo
El dev usa una extensión de la tarjeta de su hermana (corta el 6, se paga el 20). Las compras con tarjeta no salen hoy
de su saldo pero las paga después. La app debe recordarle corte y pago y decirle cuánto puede gastar sin quebrar
(gana ₡150 000, compra ₡200 000 con tarjeta → al pagar le faltan ₡50 000).
## Requisitos
- Al registrar un gasto se elige método de pago: "Efectivo o débito" (como hoy) o "Tarjeta de crédito".
- Compra con tarjeta hasta el día 6 inclusive (hora CR) → se paga el 20 de ese mes; después del 6 → el 20 del mes siguiente.
- Antes de su fecha de pago la compra no baja el saldo: es deuda pendiente. Desde el 20 cuenta como gasto (pagada ese día).
- El Resumen muestra próximo corte y pago, deuda pendiente (CRC; USD aparte) y límite = saldo − deuda CRC;
  si el límite es negativo, aviso de quiebra con cuánto faltaría. "¿Puedo comprar esto?" usa ese límite.
- En Movimientos la compra se distingue: "Tarjeta · se paga el 20 nov".
## Restricciones
- Centavos enteros; CRC y USD nunca se suman. RLS intacto. Esquema solo por migración nueva `0007`.
- Correos BAC siguen como "Efectivo o débito". Corte 6 y pago 20 fijos en el dominio (una sola tarjeta).
## Criterios de aceptación
- AC-1: compra el 6 → pago el 20 del mismo mes; el 7 → el 20 del siguiente; diciembre → enero.
- AC-2: salario ₡150 000 + compra con tarjeta ₡200 000 sin pagar → saldo ₡150 000, deuda ₡200 000, límite −₡50 000, aviso de quiebra.
- AC-3: después del 20 esa compra ya no es deuda y el saldo baja a −₡50 000.
- AC-4: el formulario guarda el método de pago; solo los gastos pueden ser con tarjeta.
- AC-5: con saldo de cuenta (BAL-01jm) registrado después del pago, la compra no se resta dos veces.
## Supuestos
- Corte del 6 inclusive (lo más conservador: la deuda vence antes).
- El pago de la tarjeta no se registra a mano: el 20 la compra pasa sola a gasto (registrarlo además la restaría dos veces).
- Sin push de recordatorio en esta entrega: las fechas se ven en el Resumen.
