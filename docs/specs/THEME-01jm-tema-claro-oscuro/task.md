# THEME-01jm — Tareas

- [x] THEME-01jm-T01: `src/domain/theme.ts` + test: `initialTheme(saved, prefersDark)` y `nextTheme(theme)`; valores guardados inválidos se ignoran (AC-4).
- [x] THEME-01jm-T02: tokens oscuros en `theme.css` (`[data-theme="dark"]` y `prefers-color-scheme` sin elección) y tabla de contraste en `paleta-de-colores.md` (AC-2, AC-5).
- [x] THEME-01jm-T03: `ThemeToggle.tsx` + test con `renderToStaticMarkup` del texto del botón; montarlo en el header del Dashboard y en `LoginView` (AC-1, AC-3).
- [x] THEME-01jm-T04: script inline en `index.html` que aplica el tema guardado antes de pintar, con try/catch (AC-6).
- [ ] THEME-01jm-T05: `pnpm typecheck` y `pnpm test` en verde; probar a mano claro/oscuro/recarga.
