# NAV-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de DASH-01jm (AppShell) y UX-01jm (vidrio).

## Tareas
- [x] NAV-01jm-T01 Prueba + iconos SVG decorativos y etiqueta en `AppShell`; barra inferior estilo app en móvil [src/ui/AppShell.tsx, src/ui/shell.css, src/ui/route.test.tsx] (AC-1–AC-3)
  - Evidencia: rojo route.test.tsx (2 fallos: sin `<span>` ni `svg aria-hidden`); verde 248 tests; typecheck y build OK.
