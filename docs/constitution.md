# MyPayTracker — Constitución

## 1. Problema y solución
No sé cuánto entra, cuánto sale ni si puedo comprar algo. Ingreso mi salario; la app lee mis correos bancarios (regex primero, IA si ningún regex coincide); las compras con tarjeta de crédito las registro manualmente. Responde: "¿puedo comprar esto?" = salario + ingresos − gastos ≥ precio.

## 2. Stack simple
React + Vite + TypeScript, Supabase (Postgres, Auth, Edge Function con cron para Gmail), Vitest. Sin dependencias nuevas si unas líneas bastan.

## 3. Relación spec ↔ código
Cada feature tiene `docs/specs/TICKET-nombre/` con `spec.md` → `plan.md` → `task.md` (ver `Claude.md`) y criterios numerados; cada criterio tiene un test (`AC-n`). Flujo: spec → test → código. Límites: `spec.md` 10–30 líneas, `plan.md` 20–50 (sin código), `task.md` máx. 100 (1–2 líneas por tarea); si se pasa, se divide en sub-features.

## 4. Separación de capas
`src/domain/` lógica pura (saldo, parsers), sin React ni Supabase. `src/data/` queries a Supabase. `src/ui/` componentes React, sin lógica ni SQL.

## 5. Pruebas unitarias TDD
Red → green → refactor. Todo `domain/` con test previo; parsers probados con correos reales anonimizados; IA simulada en tests. `pnpm test` pasa antes de cada commit.

## 6. Datos persistentes
Postgres en Supabase: `settings(user_id, salary)` y `transactions(user_id, amount numeric(12,2), direction in|out, source email_regex|email_ai|manual, description, occurred_at, email_message_id unique)`. RLS en todas las tablas, cambios solo por migraciones, secretos en Supabase secrets.
