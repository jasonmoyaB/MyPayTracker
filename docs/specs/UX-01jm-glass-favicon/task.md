# UX-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. pnpm, Vitest (entorno node).

## Tareas
- [x] UX-01jm-T01 Prueba de contraste AA de los tokens de vidrio en ambos temas + tokens/estilos glass y fallbacks [src/ui/theme.css, src/ui/theme.contrast.test.ts] (AC-1, AC-2, AC-3)
  - Evidencia: theme.contrast.test.ts 27/27 (24 pares texto/vidrio/fondo ≥ 4.5 en claro y oscuro); vite.config.ts procesa theme.css en Vitest
- [ ] UX-01jm-T02 Iconos 32/180/192/512 + logo reducido; originales a docs/design/marca/ [public/icons/*, docs/design/marca/*] (AC-4, AC-5)
- [ ] UX-01jm-T03 Favicon, apple-touch-icon y theme-color en index.html; logo en LoginView [index.html, src/ui/auth/LoginView.tsx] (AC-4, AC-6) (depende de T02)
- [ ] UX-01jm-T04 Documentar el estilo vidrio [docs/design/paleta-de-colores.md, docs/design/fundamentos-ui-ux.md]
