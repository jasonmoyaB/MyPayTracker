# MOV-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de DASH-01jm (`costaRicaMonth`, navegación).

## Tareas
- [ ] MOV-01jm-T01 Prueba + `validateFilter`, `applyFilter`, `filterTotals`, `presetRange` con bordes CR [src/domain/movementFilter.ts, src/domain/movementFilter.test.ts] (AC-1–AC-5)
- [ ] MOV-01jm-T02 Prueba + `MovementFilters` y `FilterTotals` accesibles [src/ui/transactions/MovementFilters.tsx, src/ui/transactions/FilterTotals.tsx, src/ui/transactions/filters.test.tsx] (AC-1–AC-5)
- [ ] MOV-01jm-T03 `TransactionsPanel` filtra, muestra totales y vacío con "Limpiar filtros"; filtro elevado al shell [src/ui/transactions/TransactionsPanel.tsx, src/ui/App.tsx] (AC-6–AC-8) (depende de T01, T02)
