# NAV-02jm — Plan

## Alcance
Solo capa `src/ui/`. No toca dominio, datos ni Supabase.

## Módulos
- `src/ui/route.ts`: `ROUTES` suma `'opciones'`. `parseRoute` y `useRoute` no cambian.
- `src/ui/AppShell.tsx`: cuarta entrada en `LINKS` con un icono de engranaje en SVG.
- `src/ui/options/OptionsView.tsx` (nuevo)
  - Tarjeta "Apariencia" con `ThemeToggle`. Su h2 lleva `tabIndex -1` y recibe el foco al entrar.
  - `ChangePasswordView` con el email de la sesión.
  - Tarjeta "Sesión" con el correo y el botón "Cerrar sesión", que llama a `signOut`.
  - No importa Supabase: `signOut` llega por prop desde `App`, que ya lo importa de `src/data/auth`.
- `src/ui/account/AccountView.tsx`: quita `ChangePasswordView` y la prop `email`, que queda sin uso.
- `src/ui/App.tsx`
  - El encabezado deja solo el título.
  - `Screen` enruta `'opciones'` a `OptionsView`.

## Decisiones
- `signOut` por prop: mantiene `OptionsView` probable con `renderToStaticMarkup` sin mocks de auth.
- Cuatro secciones en móvil: etiquetas de 12px con `flex: 1`; "Movimientos" es la más larga y cabe a 360px.

## Pruebas
- `route.test.tsx`: cuatro enlaces, parseo de `#/opciones`.
- `OptionsView.test.tsx`: tema, cambiar contraseña, correo y cerrar sesión; primer h2 con `tabindex -1`.
- `App.test.tsx` y `AccountView.test.tsx`: Cuenta ya no muestra "Cambiar contraseña"; Opciones sí.

## Riesgos
- Al quitar el correo del encabezado, el usuario pierde de vista con qué cuenta entró:
  queda visible en Opciones.
