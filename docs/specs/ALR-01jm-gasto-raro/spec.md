# ALR-01jm — Aviso de gasto raro
## Objetivo
Si llega un cobro mucho más alto de lo normal en un comercio (error o fraude), quiero enterarme en el momento.
## Requisitos
- Cuando el cron guarda un gasto nuevo de correo, compara con los gastos anteriores del mismo comercio y moneda.
- Si hay al menos 3 anteriores y el nuevo es más del doble de la mediana, manda un push:
  "Gasto inusual: AUTO MERCADO ₡95 000 (normal ₡30 000)".
- Un gasto avisa una sola vez (solo al insertarse por primera vez).
## Restricciones
- Sin migración: el upsert del cron ya devuelve solo las filas nuevas. Lógica pura en domain.
- Mismo comercio = descripción normalizada (sin mayúsculas, tildes ni espacios extra). CRC y USD no se mezclan.
- Pagos de tarjeta no se evalúan. Nunca rompe el sync (errores al log).
## Criterios de aceptación
- AC-1: anteriores ₡30 000, ₡28 000, ₡32 000; nuevo ₡95 000 → aviso con normal ₡30 000.
- AC-2: mismo historial, nuevo ₡55 000 → sin aviso.
- AC-3: solo 2 anteriores → sin aviso.
- AC-4: anteriores en USD y nuevo en CRC → sin aviso (no hay historial en CRC).
## Supuestos
- Los gastos manuales no avisan (los registro yo).
- El push de gasto raro reemplaza al push normal de ese movimiento (no llegan dos).
