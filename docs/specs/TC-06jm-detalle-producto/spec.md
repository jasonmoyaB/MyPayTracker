# TC-06jm — Detalle de cada producto en deuda
## Objetivo
En la lista de productos del card "Tarjeta de crédito" el dev ve cuánto falta y la próxima cuota, pero no el resto
del calendario. Al tocar un producto quiere un modal con todas sus cuotas pendientes.
## Requisitos
- Cada producto de la lista se puede tocar (y activar con teclado); abre un modal con:
  nombre, total que falta y una tabla con cada cuota pendiente (fecha de pago y monto).
- El modal se cierra con "Cerrar", con Esc o tocando fuera de él, y el foco vuelve al producto.
- La fila de la lista se ve igual que hoy.
## Restricciones
- `<dialog>` nativo: sin dependencias ni animaciones (UX-04jm se revirtió por lag).
- Mismos datos que la lista (`pendingPurchases`); centavos enteros; la moneda de cada compra.
- Tabla accesible: `<table>` con `<caption>` y `<th scope="col">`, como TC-03jm.
## Criterios de aceptación
- AC-1: anillo de ₡35 000 en 3 cuotas desde el 20 nov → el modal lista 20 nov, 20 dic y 20 ene con sus montos y
  "Falta ₡35 000".
- AC-2: cada producto es un botón con `aria-haspopup="dialog"` y su propio modal.
## Supuestos
- Tocar fuera se detecta por coordenadas (el fondo es parte del `<dialog>`); `closedby="any"` aún no está en Safari.
