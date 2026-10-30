# UX-06jm — Tablas de "¿Puedo comprar esto?" en el móvil
## Objetivo
En el celular las tablas "Cuota por plazo" y "Lo que te queda libre cada mes" no se entienden: el plazo
("Tasa cero 12 meses") se parte en dos renglones, la cuota queda pegada al primer pago y la columna
"Recomendación" ocupa mucho para decir solo "Sí", "Ajustado" o "No".
## Requisitos
- Las celdas tienen separación entre columnas y una línea entre filas; ningún valor se parte en dos renglones.
- En la tabla, el plazo dice "Un pago" o "N meses"; el título aclara "(tasa cero)".
- La columna de recomendación se llama "¿Alcanza?" y es tan angosta como su texto.
- Montos alineados a la derecha para compararlos de un vistazo.
## Restricciones
- Solo CSS y textos de la tabla; sin dependencias. El select de forma de pago no cambia.
- Cabe en 360 px de ancho; si no cabe, la tabla se desplaza sola (ya tiene `overflow-x: auto`).
## Criterios de aceptación
- AC-1: encabezados "Plazo", "Cuota al mes", "Primer pago", "¿Alcanza?"; filas "Un pago", "3 meses"… "12 meses".
- AC-2: ambas tablas usan la clase `plan-table` (padding, `nowrap`, montos a la derecha).
## Supuestos
- "¿Alcanza?" responde mejor a la pregunta del card que "Recomendación" y es más corto.
