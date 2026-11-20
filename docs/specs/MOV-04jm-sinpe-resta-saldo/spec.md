# MOV-04jm — Un gasto SINPE vuelve a bajar el saldo disponible
## Objetivo
Los SINPE hechos desde la app del BAC no mandan correo, así que solo entran a MyPayTracker cuando el dev los
registra a mano. MOV-03jm hizo que un gasto SINPE no bajara el saldo, y la app queda más alta que el BAC.
Se revierte: un gasto SINPE baja el saldo como cualquier gasto.
## Requisitos
- Un gasto con forma de pago SINPE baja el saldo disponible (Resumen, "Puedes gastar", "¿Puedo comprar esto?" y
  el conector MCP).
- Sigue en Movimientos y en los gastos del mes. Ingresos SINPE, efectivo/débito y tarjeta sin cambios.
## Restricciones
- Se quita la regla de `summaryFor` (domain), compartida por app y MCP. Sin migración. Centavos y CRC/USD intactos.
## Criterios de aceptación
- AC-1: saldo de cuenta ₡58 930 y un gasto SINPE de ₡3 500 posterior → saldo disponible ₡55 430.
- AC-2: el mismo gasto en efectivo → ₡55 430.
- AC-3: un ingreso SINPE de ₡3 500 → ₡62 430.
- AC-4: el gasto SINPE sigue sumando en los gastos del mes (`monthStats`).
## Supuestos
- Reemplaza a MOV-03jm. Si el dev copia en Cuenta un saldo del BAC que ya trae el SINPE, debe registrar el SINPE
  con fecha anterior a la del saldo (o no registrarlo) para no restarlo dos veces; así funciona hoy cualquier gasto.
- El MCP toma el cambio al volver a desplegarlo (no se despliega aquí).
