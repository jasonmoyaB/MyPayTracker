# SIM-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-02jm y TC-03jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] SIM-01jm-T01 Prueba + `monthly` en `recommend` (libre por mes de cada cuota nueva) [src/domain/recommend.ts] (AC-1, AC-2, AC-3)
  - Evidencia: rojo 4 fallos (sin `monthly`); verde 377/377; typecheck OK.
- [ ] SIM-01jm-T02 Prueba + `MonthTable` y uso en `AffordCheck` [src/ui/balance/PlanTable.tsx, AffordCheck.tsx] (AC-2, AC-3, AC-4)
