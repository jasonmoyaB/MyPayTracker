# THEME-01jm — Plan

## Tokens (CSS)
- `src/ui/theme.css`: mantener `:root` como tema claro. Añadir el bloque oscuro con los mismos nombres de token
  bajo `:root[data-theme="dark"]` y, para quien nunca eligió, bajo
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }`.
- `color-scheme: dark` en el bloque oscuro para que controles nativos y scrollbars acompañen.
- Los componentes no cambian: ya usan tokens por función.

## Lógica (domain)
- `src/domain/theme.ts`: función pura que decide el tema inicial a partir de (valor guardado, prefiere oscuro)
  y otra que da el tema opuesto. Ignora valores guardados inválidos. Test previo.

## Estado y persistencia (ui)
- `src/ui/theme/ThemeToggle.tsx`: lee el tema actual de `document.documentElement.dataset.theme`,
  al pulsar lo invierte, escribe `data-theme` y guarda en `localStorage` dentro de try/catch
  (modo privado o almacenamiento bloqueado no rompe la app).
- Botón con clase `secondary`, texto que nombra el tema destino, `aria-pressed` no (el texto ya lo dice).

## Sin parpadeo
- Script inline mínimo en `index.html` (antes del bundle) que pone `data-theme` desde `localStorage`.
  Sin valor guardado no pone nada y el CSS cae en `prefers-color-scheme`.

## Ubicación
- `App.tsx`: botón en el header del Dashboard junto a "Cerrar sesión".
- `LoginView.tsx`: mismo botón arriba de la tarjeta de login.

## Diseño
- `docs/design/paleta-de-colores.md`: nueva sección del tema oscuro con tabla de tokens y ratios de contraste,
  y actualizar la nota del §7 que decía "futuro tema oscuro".
