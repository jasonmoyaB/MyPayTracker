# ARQ-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. npm, Vitest.

## Tareas
- [ ] ARQ-01jm-T01 Scaffold Vite react-ts + Vitest + script `typecheck`; app movida a `src/ui/` [package.json, src/ui/*, index.html]
- [ ] ARQ-01jm-T02 Prueba: `canAfford` falla → implementar en domain [src/domain/balance*.ts]
- [ ] ARQ-01jm-T03 Prueba: test de arquitectura detecta imports prohibidos → reglas por capa [src/architecture.test.ts]
- [ ] ARQ-01jm-T04 Cliente Supabase en data + `.env.example` [src/data/supabase.ts, .env.example] (depende de T01)
- [ ] ARQ-01jm-T05 Migración inicial con RLS [supabase/migrations/0001_init.sql]
