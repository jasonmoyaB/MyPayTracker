# NAV-01jm — Plan

## Alcance
Solo capa `src/ui/`. No toca dominio, datos ni Supabase.

## Módulos
- `src/ui/AppShell.tsx`
  - Cada entrada de `LINKS` gana su icono (trazos SVG de 24×24 en línea).
  - El enlace renderiza `svg` decorativo + `span` con la etiqueta.
  - Ruteo por hash, foco y scroll quedan igual.
- `src/ui/shell.css`
  - Escritorio: icono y etiqueta en fila, tamaño 20px.
  - Móvil (≤ 640px):
    - Barra fija abajo sin bordes redondeados, solo borde superior.
    - Enlaces en columna: icono 24px arriba, etiqueta 12px abajo.
    - Activo: color primario en icono y etiqueta, sin fondo, para parecerse a apps nativas.
    - Alto ≥ 56px + `env(safe-area-inset-bottom)`; el padding inferior de `.app-shell`
      y la posición de `.toasts` se ajustan a ese alto.

## Decisiones
- SVG en línea con `stroke="currentColor"`: hereda el color del estado activo y del tema
  claro/oscuro sin CSS extra ni librerías de iconos.
- `aria-hidden` en el icono: el nombre accesible sigue siendo la etiqueta.
- Se mantiene el vidrio existente y los fallbacks de transparencia reducida.

## Pruebas
- `route.test.tsx`: cada enlace tiene `svg aria-hidden` y la etiqueta; un único `aria-current`.
- Revisión visual a 390px en navegador.

## Riesgos
- Que la barra tape el último elemento: se cubre con el padding inferior de `.app-shell`.
- Que se rompa el test de contraste: no se tocan tokens de `theme.css`.
