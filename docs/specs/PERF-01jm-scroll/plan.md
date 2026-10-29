# PERF-01jm — Plan

## Base
spec.md de esta carpeta; mediciones con el arnés (CSS de `dist/` + markup del Resumen y 120 movimientos, scroll por `requestAnimationFrame`).

## Cambios
### 1. `src/ui/theme.css`
- `.card, dialog`: se quitan `backdrop-filter` y `-webkit-backdrop-filter`; quedan `--glass-bg`, borde y brillo interior.
- `body`: sin `background-attachment: fixed`.
- El grano deja de ser un `body::before` fijo: pasa a ser la primera capa del fondo, con la opacidad dentro del SVG (`--grain-opacity` desaparece).
- Los fallbacks opacos (`@supports not`, `prefers-reduced-transparency`) se mantienen.

### 2. `src/ui/shell.css` y `src/ui/toast/toast.css`
- Sin cambios: la navegación y los toasts siguen con desenfoque (son pequeños y el contenido pasa por debajo).

### 3. Pruebas (`src/ui/theme.contrast.test.ts`)
- La prueba "las superficies usan backdrop-filter" pasa a: `.card` sin `backdrop-filter`, la navegación con él y el fondo sin `fixed`.
- Las pruebas de contraste no cambian: ya miden el vidrio sobre el color opaco de cada mancha, que es el peor caso sin desenfoque.

### 4. Documentación
- `paleta-de-colores.md` §9 y `fundamentos-ui-ux.md` §5: el desenfoque es solo para capas flotantes.

## Riesgos
- Sin desenfoque, las tarjetas se ven un poco más planas. Lo compensan la translucidez, el borde y el brillo.
