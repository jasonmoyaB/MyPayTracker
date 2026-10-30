# UX-07jm — Botones del detalle de una deuda
## Objetivo
En el detalle de un producto en deuda, "Cerrar", "Editar" y "Eliminar deuda" quedaban desparejos y mal ubicados en el móvil.
## Requisitos
- Una fila de botones del mismo ancho, de 44 px de alto como mínimo, con el texto en una sola línea.
- Orden: "Eliminar" (rojo) a la izquierda, lejos del pulgar; "Cerrar" (secundario) al centro; "Editar" (principal) a la derecha.
- Con el formulario de edición abierto, "Editar" dice "Cancelar" y lo cierra.
## Restricciones
- Solo CSS y textos; la confirmación al borrar no cambia. Sin dependencias.
## Criterios de aceptación
- AC-1: el detalle muestra Eliminar, Cerrar y Editar en ese orden dentro de `.dialog-actions`.
## Supuestos
- "Eliminar" a secas basta: el título del detalle ya es el producto y la confirmación nombra la deuda.
