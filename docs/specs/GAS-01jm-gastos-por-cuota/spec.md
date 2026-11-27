# GAS-01jm — Los gastos del mes cuentan lo que pago ese mes
## Objetivo
Hoy una compra con tarjeta suma completa en los gastos del mes en que la hice. Si compré una pantalla de
₡194 000 a tasa cero 12 meses, ese mes no gasté ₡194 000: pago ₡16 166,67 al mes. Los gastos del mes deben mostrar
solo lo que toca pagar ese mes.
## Regla de la tarjeta (no olvidar)
- La tarjeta **corta el 6** y **se paga el 20** de cada mes (hora de Costa Rica).
- Compra hasta el 6 inclusive → se paga el 20 de ese mes. Compra después del 6 → se paga el 20 del mes siguiente.
- Ejemplo: compro el 27/11/2026 → pago el 20 de diciembre. Compro el 6/12 → pago el 20 de diciembre.
  Compro el 7/12 → pago el 20 de enero.
- Con tasa cero a N meses, cada cuota vence un 20 seguido a partir del primer pago (la primera lleva el resto de centavos).
## Requisitos
- "Este mes" (Gastos y Neto) y "Top gastos" del Resumen cuentan cada compra con tarjeta como sus cuotas, en el mes
  del 20 en que vence cada una. Efectivo, débito y SINPE cuentan en su fecha, como hoy.
- El pago de la tarjeta (descripción de tarjeta, como en "¿Puedo comprar esto?") no suma como gasto: serían las mismas cuotas otra vez.
- Movimientos: los totales del filtro usan la misma regla; la lista sigue mostrando cada movimiento tal cual.
- El conector MCP (`resumen_mes`) usa la misma regla.
## Restricciones
- Reutiliza la regla de corte y cuotas que ya existe (TC-01jm, TC-02jm). Sin migración. Centavos; CRC y USD nunca se suman.
## Criterios de aceptación
- AC-1: pantalla ₡194 000 a 12 meses comprada el 27/11/2026 → gastos de nov ₡0 por ella; dic ₡16 166,74; ene ₡16 166,66.
- AC-2: compra de ₡10 000 en un pago el 6/12 → cuenta en dic; el 7/12 → cuenta en ene.
- AC-3: un gasto en efectivo cuenta en su fecha; un pago de tarjeta no cuenta como gasto.
- AC-4: el Resumen, los totales de Movimientos y `resumen_mes` dan la misma cifra de gastos del mes.
## Supuestos
- Una cuota cuenta en su mes aunque aún no se haya marcado "Ya pagué" (es lo que toca pagar ese mes).
- El MCP toma el cambio al volver a desplegarlo (no se despliega aquí).
