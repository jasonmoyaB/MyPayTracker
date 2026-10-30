# MOV-02jm — SINPE como forma de pago al registrar un movimiento
## Objetivo
En Movimientos ya existe "Registrar movimiento" (monto, moneda, gasto o ingreso, descripción, fecha y método), pero el
método solo ofrece "Efectivo o débito" y "Tarjeta de crédito", y solo en gastos. El dev quiere marcar SINPE, que en
Costa Rica es como paga y cobra casi todo, tanto en salidas como en ingresos.
## Requisitos
- "Forma de pago" ofrece: Efectivo o débito, SINPE y Tarjeta de crédito (esta, solo en gastos).
- En ingresos también se elige la forma de pago (Efectivo o débito, o SINPE); antes no se mostraba.
- SINPE se comporta como efectivo: baja o sube el saldo en su fecha, sin plazos ni día de pago.
- La lista de movimientos dice "SINPE · Manual" (o "SINPE · Correo BAC") para distinguirlo.
## Restricciones
- Migración nueva `0012`; no se editan migraciones aplicadas. RLS, centavos, CRC/USD separados y fecha CR intactos.
- La tarjeta sigue siendo solo para gastos y las cuotas (>1) solo con tarjeta: la BD lo sigue exigiendo.
- Sin dependencias. Lo ya guardado no cambia (queda en `cash`/`credit`).
## Criterios de aceptación
- AC-1: la BD acepta `payment_method = 'sinpe'` en gastos e ingresos y rechaza `credit` en ingresos.
- AC-2: el formulario en gasto ofrece las 3 formas; en ingreso, Efectivo o débito y SINPE; guarda `sinpe` con 1 cuota.
- AC-3: un gasto SINPE baja el saldo en su fecha (no queda como deuda de tarjeta).
- AC-4: la fila de un movimiento SINPE muestra "SINPE · Manual".
## Supuestos
- `docs/mapa-de-la-app.md` no existe; se toma como referencia la pantalla actual de Movimientos.
- Los correos SINPE del BAC siguen guardándose como `cash`: marcarlos `sinpe` y reclasificar los ya guardados es
  otra feature (toca el parser y la sincronización).
- "Razón" = el campo Descripción existente; "fecha" = el campo Fecha y hora existente (no se duplican).
- Filtrar por forma de pago queda fuera; no se pidió.
