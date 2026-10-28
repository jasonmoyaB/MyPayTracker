# MOV-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de DASH-01jm (`costaRicaMonth`, navegación).

## Tareas
- [x] MOV-01jm-T01 Prueba + `validateFilter`, `applyFilter`, `filterTotals`, `presetRange` con bordes CR [src/domain/movementFilter.ts, src/domain/movementFilter.test.ts] (AC-1–AC-5)
  - Evidencia: rojo (módulo inexistente) → verde 8 tests en movementFilter.test.ts; `CR_OFFSET_MS` único en date.ts, reutilizado en monthStats.ts.
- [x] MOV-01jm-T02 Prueba + `MovementFilters` y `FilterTotals` accesibles [src/ui/transactions/MovementFilters.tsx, src/ui/transactions/FilterTotals.tsx, src/ui/transactions/filters.test.tsx] (AC-1–AC-5)
  - Evidencia: rojo (módulos inexistentes) → verde 8 tests en filters.test.tsx; `formatSigned` en format.ts reutilizado por MonthCards; estilos en transactions.css.
- [x] MOV-01jm-T03 `TransactionsPanel` filtra, muestra totales y vacío con "Limpiar filtros"; filtro elevado al shell [src/ui/transactions/TransactionsPanel.tsx, src/ui/App.tsx] (AC-6–AC-8) (depende de T01, T02)
  - Evidencia: rojo 4 tests (TransactionsPanel.test.tsx, App.test.tsx) → verde; filtro en `useState` de Dashboard; Resumen recibe la lista completa.

## Correcciones de revisión
- [x] MOV-01jm-T04 "Limpiar filtros" quita fechas y tipo (`clearedFilter`); pruebas de día CR vs UTC; aria en "Hasta"; totales con `aria-live` y `formatSigned` [src/domain/movementFilter*, src/ui/transactions/*]
  - Evidencia: movementFilter.test.ts +2 (limpiar con mes vacío, 21:00 CR / 05:59Z); typecheck OK
