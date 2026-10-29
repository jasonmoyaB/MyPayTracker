# TC-02jm — "¿Puedo comprar esto?" con tarjeta y tasa cero
## Objetivo
Antes de comprar, el dev elige cómo pagaría (efectivo, tarjeta en un pago o tasa cero) y el sistema le recomienda
si comprar o no: si le alcanza para el próximo pago y si puede mantener las cuotas con su salario mensual.
## Requisitos
- "¿Puedo comprar esto?" suma "Forma de pago": Efectivo o débito / Tarjeta (un pago) / Tasa cero 3, 6, 10 o 12 meses
  (plazos de BAC Costa Rica; 18–36 meses son de Panamá) y "Plata extra que te entra (opcional)".
- Tasa cero: cuota = precio ÷ meses (el resto de centavos va en la primera); primera cuota en la fecha de pago de TC-01jm.
- Al registrar un gasto con tarjeta se elige también el plazo; cada cuota cuenta como gasto en su día 20 y antes es deuda.
- Disponible hoy = saldo − lo que vence el próximo día 20 + plata extra. Las cuotas posteriores se juzgan contra el salario.
- Recomendación:
  - **No**: el próximo pago te deja en negativo, o tu mes más cargado de cuotas supera tu salario.
  - **Ajustado**: las cuotas del mes más cargado pasan del 30 % del salario.
  - **Sí**: en otro caso.
  - Sin salario registrado solo se evalúa el próximo pago y se pide registrarlo en Cuenta.
- El Resumen usa el mismo "disponible hoy" y avisa si las cuotas de algún mes superan el salario.
## Restricciones
- Centavos enteros; solo CRC en el cálculo (USD aparte). Migración nueva `0008`; sin dependencias.
## Criterios de aceptación
- AC-1: ₡90 000 a 3 meses → 3 cuotas de ₡30 000 los 20 de los 3 meses siguientes al corte; ₡100 000 a 3 → 33 333,34 + 33 333,33 ×2.
- AC-2: salario ₡150 000, compra de ₡200 000 en un pago → "No" (te faltarían ₡50 000).
- AC-3: salario ₡150 000, ₡200 000 a 6 meses → primera cuota ₡33 333,35 (22 %) → "Sí"; a 3 meses → ₡66 666,68 (44 %) → "Ajustado".
- AC-4: con plata extra suficiente, el "No" por el próximo pago pasa a "Sí"/"Ajustado".
- AC-5: un plazo distinto de 1 solo se guarda con tarjeta (check en la BD).
## Supuestos
- 30 % del salario como tope sano de cuotas (regla común de endeudamiento); se ajusta en una constante del dominio.
- "Plata extra" es un ingreso único para esta evaluación; no se guarda.
