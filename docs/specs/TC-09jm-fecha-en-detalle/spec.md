# TC-09jm — Fecha de compra en el detalle de la deuda
## Objetivo
El detalle de un producto en deuda muestra lo que falta y las cuotas, pero no cuándo se compró.
## Requisitos
- Bajo el nombre del producto: "Comprado el 10 sep 2026" (día, mes corto y año, hora CR).
## Restricciones
- Solo UI; la fecha es la guardada (`occurred_at`). Sin migración ni dependencias.
## Criterios de aceptación
- AC-1: compra del 29 oct 2026 → el detalle dice "Comprado el 29 oct 2026".
## Supuestos
- Con año porque una compra a 12 meses puede ser del año anterior (los días de pago no lo llevan).
- Una deuda cargada sin fecha muestra el día en que se cargó; se corrige con "Editar" (TC-08jm).
