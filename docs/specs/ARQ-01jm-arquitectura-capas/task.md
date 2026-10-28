# ARQ-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Vitest; npm al inicio, migrado a pnpm en `8cf8222`.

## Tareas
- [x] ARQ-01jm-T01 Scaffold Vite react-ts + Vitest + script `typecheck`; app movida a `src/ui/` [package.json, src/ui/*, index.html]
  - typecheck y vite build OK
- [x] ARQ-01jm-T02 Prueba: `canAfford` falla → implementar en domain [src/domain/balance*.ts]
  - 3 tests verdes (rojo primero: módulo inexistente)
- [x] ARQ-01jm-T03 Prueba: test de arquitectura detecta imports prohibidos → reglas por capa [src/architecture.test.ts]
  - 4 tests verdes; rojo previo en AC-2 sin data/
- [x] ARQ-01jm-T04 Cliente Supabase en data + `.env.example` [src/data/supabase.ts, .env.example] (depende de T01)
  - typecheck OK; falla rápido si faltan variables
- [x] ARQ-01jm-T05 Migración inicial con RLS [supabase/migrations/0001_init.sql]
  - aplicada al remoto con `db push`; curl confirma tablas y RLS
