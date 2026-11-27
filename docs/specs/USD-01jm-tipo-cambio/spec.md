# USD-01jm — Tipo de cambio para ver los dólares en colones
## Objetivo
Los movimientos en dólares se muestran aparte y no sé cuánto representan en colones.
## Requisitos
- En Cuenta registro un tipo de cambio manual (colones por dólar, p. ej. 505,32).
- En el Resumen, junto a lo de USD, se ve su equivalente "≈ ₡X al tipo ₡505,32".
- El equivalente es solo informativo: no se suma al saldo, a los gastos ni a "¿Puedo comprar esto?".
- Sin tipo de cambio guardado no se muestra ningún equivalente.
## Restricciones
- Migración nueva: `settings.usd_rate numeric(10,2)` con check `> 0`, nula por defecto. RLS de settings sin cambios.
- Invariante: nunca se suman CRC y USD. Conversión en centavos enteros con redondeo al céntimo más cercano.
## Criterios de aceptación
- AC-1: $100,00 con tipo 505,32 → ≈ ₡50 532,00.
- AC-2: $0,01 con tipo 505,32 → ≈ ₡5,05 (redondeo al céntimo).
- AC-3: tipo inválido (0, negativo o texto) → error y no se guarda.
- AC-4: sin tipo guardado, el Resumen no muestra equivalente.
## Supuestos
- Un solo tipo (el de compra o venta, el que el dev use); se actualiza a mano. Sin API de tipo de cambio.
- El número de la migración es el siguiente libre al implementarla (después de `0014`).
