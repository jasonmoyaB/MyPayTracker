# MOV-03jm — Un gasto SINPE no baja el saldo disponible
> **Reemplazado por MOV-04jm:** un gasto SINPE vuelve a bajar el saldo.
## Objetivo
El dev tenía ₡58 930 en el BAC, hizo un SINPE de ₡3 500 desde la app del BAC y luego lo registró en MyPayTracker.
El BAC ya lo había rebajado (y ese es el saldo que el dev copia en Cuenta), así que la app lo restó dos veces
(₡7 000). Un SINPE móvil sale de la cuenta del BAC y se registra solo para llevar el gasto.
## Requisitos
- Un gasto con forma de pago SINPE no baja el saldo disponible (Resumen, "Puedes gastar", "¿Puedo comprar esto?" y
  el conector MCP).
- Sigue apareciendo en Movimientos y cuenta en "Gastos este mes", el top de gastos y el promedio mensual.
- Los ingresos SINPE, el efectivo/débito y la tarjeta no cambian.
## Restricciones
- Una sola regla en domain, compartida por la app y el MCP. Sin migración. Centavos y CRC/USD intactos.
## Criterios de aceptación
- AC-1: saldo de cuenta ₡58 930 y un gasto SINPE de ₡3 500 posterior → saldo disponible ₡58 930.
- AC-2: el mismo gasto en efectivo → ₡55 430 (sin cambios).
- AC-3: un ingreso SINPE de ₡3 500 → ₡62 430 (sin cambios).
- AC-4: el gasto SINPE sigue sumando en los gastos del mes (`monthStats`).
## Supuestos
- El saldo de cuenta se actualiza copiando el del BAC; si no se actualiza, un SINPE enviado no se refleja en el saldo
  (lo pidió así el dev).
- El ingreso SINPE sí suma: los correos "se acreditó" del BAC ya llegan como ingreso y el dev no pidió cambiarlo.
