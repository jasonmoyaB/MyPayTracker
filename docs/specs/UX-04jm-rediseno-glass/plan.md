# UX-04jm — Plan

## Base
spec.md de esta carpeta; tokens y vidrio de UX-01jm (`src/ui/theme.css`, paleta §9).

## Módulos

### 1. Tokens y base (`src/ui/theme.css`, `index.html`)
- Mismos colores de marca y semánticos (sus contrastes ya están verificados).
- Fondo: tres manchas (`--blob-1..3`) más un grano SVG muy tenue fijo, para que el vidrio tenga algo que desenfocar.
- Vidrio: blur 20 px, `saturate(160%)`, brillo interior (`inset 0 1px 0`) y sombra en dos capas.
- Nuevos tokens de forma: `--radius-lg` (20 px), `--radius-md` (12 px), `--ease`.
- Botones y campos con radio `--radius-md`; botón secundario de vidrio; `:active` con leve escala.
- Fuente Geist (Google Fonts, `display=swap`) con fallback `system-ui`.
- `p` sin margen dentro de `.card` (la cuadrícula ya separa): quita los `style={{ margin: 0 }}` repetidos.
- El test de contraste añade `--blob-3` al peor caso.

### 2. Shell (`src/ui/shell.css`, `App.tsx`)
- Encabezado sin caja: marca (símbolo + nombre) a la izquierda.
- Navegación: píldora de vidrio centrada y pegajosa arriba; en móvil, píldora flotante a 12 px de los bordes con zona segura.

### 3. Resumen (`dashboard.css`, componentes de `dashboard/`)
- Escritorio (≥ 960 px): 6 columnas, `dense`. Fila 1: saldo 4 + tarjeta 2. Fila 2: mes 3 + top 3. Fila 3: recientes 3 + compra 3; si no hay compra, recientes ocupa 6.
- Saldo: etiqueta pequeña, número `clamp(44px, 10vw, 72px)`, `letter-spacing` negativo y halo de acento.
- Estadísticas sin cajas anidadas: separador vertical fino.
- Entrada escalonada por `:nth-child` (fade + 8 px).

### 4. Formularios, listas y resto (`transactions.css`, `auth.css`, `toast.css`, tabla)
- Filas con hover suave y radio; presets como chips; tabla con encabezado en texto secundario y líneas finas.
- Login y pantalla de error centrados con clase `.center-screen` en lugar de estilos en línea.

### 5. Documentación
- `paleta-de-colores.md` §9 y `fundamentos-ui-ux.md` §3–5 con los tokens y la fuente nuevos.

## Riesgos
- Más blur = más GPU: un solo nivel de vidrio, sin vidrio anidado.
- Fuente externa: si no carga, el fallback del sistema mantiene métricas parecidas.
