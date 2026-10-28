# ARQ-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. npm, Vitest.

## Tareas
- [x] ARQ-01jm-T01 Scaffold Vite react-ts + Vitest + script `typecheck`; app movida a `src/ui/` [package.json, src/ui/*, index.html]
  - typecheck y vite build OK
- [x] ARQ-01jm-T02 Prueba: `canAfford` falla → implementar en domain [src/domain/balance*.ts]
  - 3 tests verdes (rojo primero: módulo inexistente)
- [ ] ARQ-01jm-T03 Prueba: test de arquitectura detecta imports prohibidos → reglas por capa [src/architecture.test.ts]
- [ ] ARQ-01jm-T04 Cliente Supabase en data + `.env.example` [src/data/supabase.ts, .env.example] (depende de T01)
- [ ] ARQ-01jm-T05 Migración inicial con RLS [supabase/migrations/0001_init.sql]
