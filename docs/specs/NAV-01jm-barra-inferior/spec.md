# NAV-01jm — Barra de navegación inferior estilo app

## Objetivo
En el teléfono la navegación entre Resumen, Movimientos y Cuenta debe sentirse como una app nativa
(p. ej. Uber Eats): barra fija abajo, al alcance del pulgar, con icono y etiqueta por sección.

## Requisitos
- Móvil (≤ 640px): barra fija al borde inferior, a todo el ancho, respeta el área segura del iPhone.
- Cada sección muestra un icono arriba y la etiqueta corta abajo.
- La sección activa se distingue por color del icono y la etiqueta (no solo por color de fondo).
- Escritorio: la barra sigue arriba; el icono va a la izquierda de la etiqueta.
- El contenido y los avisos (toasts) no quedan tapados por la barra.

## Restricciones
- Sin dependencias nuevas: iconos SVG en línea, decorativos (`aria-hidden`).
- Se conservan el nombre accesible "Secciones", `aria-current="page"` y objetivos táctiles ≥ 44px.
- Mismo vidrio y tokens de UX-01jm; sin animaciones obligatorias.

## Criterios de aceptación
- AC-1: cada enlace tiene un `<svg aria-hidden="true">` y su etiqueta en texto visible.
- AC-2: solo la sección activa lleva `aria-current="page"`.
- AC-3: en ≤ 640px la barra queda fija abajo con icono sobre etiqueta y respeta `safe-area-inset-bottom`.

## Supuestos
- Iconos: casa (Resumen), lista (Movimientos), persona (Cuenta).
- No se ocultan las etiquetas: con 3 secciones caben y ayudan a entender.
