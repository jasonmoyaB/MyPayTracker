# UX-01jm — Plan

## Base
spec.md de esta carpeta; tokens actuales en `src/ui/theme.css` (THEME-01jm).

## Módulos

### 1. Tokens de vidrio (`src/ui/theme.css`)
- Nuevos tokens por tema: `--glass-bg`, `--glass-bg-strong` (inputs/encabezado), `--glass-border`,
  `--glass-shadow`, `--glass-blur` (≈16px), y `--page-bg` con 2–3 manchas radiales suaves de la paleta
  (verde primario, info) sobre el fondo base.
- Selector común para superficies: tarjetas, `header`, formularios y diálogos usan
  `background: var(--glass-bg)` + `backdrop-filter: blur() saturate()` + borde y sombra.
- Fallback: `@supports not (backdrop-filter: blur(1px))` y `@media (prefers-reduced-transparency: reduce)`
  vuelven a `--color-surface` opaco.
- Contraste: texto sobre vidrio usa `--color-text`; opacidad del vidrio ≥ 0.7 en claro y ≥ 0.6 en oscuro
  para no depender del fondo. Verificación con cálculo de contraste en un test (peor caso: vidrio
  mezclado sobre el color más saturado del fondo).

### 2. Iconos (`public/icons/`)
- Generar con PowerShell `System.Drawing` (sin dependencias) desde el símbolo:
  `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`.
- Logo horizontal reducido a ~640 px de ancho: `public/icons/logo.png`.
- Originales se mueven a `docs/design/marca/` para que Vite no los copie a `dist/`.

### 3. HTML y login
- `index.html`: `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<meta name="theme-color">`.
- `LoginView`: `<img src="/icons/logo.png" alt="MyPayTracker">` sobre el formulario.

### 4. Documentación
- `docs/design/paleta-de-colores.md` y `fundamentos-ui-ux.md`: sección corta "Vidrio" con tokens y
  fallback; quitar la prohibición de brillos/sombras para superficies de vidrio.

## Riesgos
- `backdrop-filter` cuesta GPU en móviles viejos: blur moderado y sin anidar vidrio dentro de vidrio.
- Contraste sobre manchas de color: se mitiga con opacidad alta del vidrio.
