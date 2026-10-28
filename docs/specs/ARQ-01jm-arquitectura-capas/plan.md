# ARQ-01jm — Plan

## Referencias
`docs/constitution.md` §2 (stack), §4 (capas), §5 (TDD), §6 (datos).

## Enfoque
Arquitectura en capas con dependencias en una sola dirección: `ui → data → domain`, y `ui → domain`.
`domain` es puro y no depende de nada, así se puede usar desde el navegador, los tests y la Edge Function.
Escala porque cada feature nueva solo agrega archivos en su capa; la regla de dependencias la vigila un test, no la memoria.

## Diseño
- Scaffold Vite `react-ts`, con la app movida a `src/ui/`.
- Vitest sin configuración extra (usa la de Vite).
- Sin ESLint ni librerías de reglas de imports: un test de arquitectura recorre `src/` y revisa los `import` con regex.
- `data/` tiene un único cliente Supabase leyendo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Migración SQL a mano en `supabase/migrations/`; restricciones en la BD (check, unique) en vez de en el código.

## Estructura objetivo
| Archivo | Capa | Responsabilidad |
|---|---|---|
| `src/domain/balance.ts` | domain | `canAfford` y saldo disponible |
| `src/domain/balance.test.ts` | domain | AC-5 |
| `src/data/supabase.ts` | data | cliente único de Supabase |
| `src/ui/App.tsx`, `src/ui/main.tsx` | ui | arranque de React |
| `src/architecture.test.ts` | — | AC-2, AC-3, AC-4 |
| `supabase/migrations/0001_init.sql` | BD | AC-6 |
| `.env.example` | — | variables requeridas |

## Pruebas
- `balance.test.ts`: saldo positivo, justo igual al precio, insuficiente.
- `architecture.test.ts`: falla al detectar un import prohibido.
- `npm run typecheck` con `tsc -b`.
