# ARQ-01jm — Arquitectura por capas

## Problema
No hay código ni estructura; sin reglas de capas el proyecto se enreda al crecer.

## Objetivo
Base React + Vite + TS + Vitest con las capas de la constitución (§4) y una prueba que impida romperlas.

## Criterios de aceptación
- AC-1: `npm test` y `npm run typecheck` pasan.
- AC-2: existen `src/domain/`, `src/data/`, `src/ui/`.
- AC-3: un test falla si `domain/` importa React, Supabase, `data/` o `ui/`.
- AC-4: un test falla si `ui/` importa `@supabase/supabase-js` directo.
- AC-5: `domain/` expone `canAfford` (salario + ingresos − gastos ≥ precio) con tests.
- AC-6: migración inicial con `settings` y `transactions` y RLS por `user_id`.

## Fuera de alcance
Pantallas, auth, lectura de Gmail, IA, routing.

## Supuestos
- npm (no pnpm), como dice la constitución (`npm test`).
- Montos en el dominio como centavos enteros; en BD `numeric(12,2)`.
- Al cerrar la spec la migración no se aplicó a remoto (se aplicó después con `db push`).
