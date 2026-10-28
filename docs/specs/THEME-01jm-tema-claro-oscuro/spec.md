# THEME-01jm — Botón de tema claro y oscuro

## Objetivo
Poder usar la app con tema oscuro (de noche, menos brillo) y volver al claro con un botón.

## Requisitos de usuario
- Un botón en el encabezado alterna entre tema claro y oscuro.
- La elección se recuerda al recargar la página.
- Si nunca elegí, la app sigue el tema del sistema operativo.

## Criterios de aceptación
- AC-1: el botón aparece en el encabezado del dashboard y en la vista de login.
- AC-2: al pulsarlo cambia todo el tema (fondos, texto, bordes, estados) sin recargar.
- AC-3: el botón dice en texto a qué tema cambia ("Tema oscuro" / "Tema claro") y es accesible por teclado.
- AC-4: la elección persiste en el navegador; sin elección guardada se usa `prefers-color-scheme`.
- AC-5: el tema oscuro tiene tokens propios con contraste AA (texto ≥ 4.5:1, bordes de control ≥ 3:1) documentados en `docs/design/paleta-de-colores.md`.
- AC-6: al cargar no hay parpadeo del tema equivocado.

## Fuera de alcance
Guardar el tema en Supabase, más de dos temas, opción "sistema" explícita.

## Supuestos
- Persistencia en `localStorage` (preferencia por navegador, no por cuenta).
