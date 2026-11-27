# ANA-01jm — Plan
## Domain (`src/domain/compare.ts`)
- `compareMonths(movements, now)` → `{ category, thisCents, lastCents, diffCents }[]` ordenado por `|diff|`.
  - Este mes: [inicio del mes CR, ahora]. Mes pasado: [inicio, mismo día recortado a fin de ese mes, 23:59 CR].
  - Recibe `monthlyCharges(...)` ya aplicado o lo aplica dentro (una sola vez).
## UI (`src/ui/dashboard/CompareCard.tsx`)
- `<table>` con `<caption>` y `<th scope="col">` (como `PlanTable`): Categoría, Este mes, Mes pasado, Diferencia.
- `formatSigned` existente para la diferencia.
- `DashboardView` la pinta después de "Top gastos".
## Pruebas
- `compare.test.ts`: AC-1, AC-2, AC-3.
- `DashboardView.test.tsx`: AC-4.
## Riesgos
- Tarjetas nuevas alargan el Resumen en móvil: va al final, antes de "¿Puedo comprar esto?".
