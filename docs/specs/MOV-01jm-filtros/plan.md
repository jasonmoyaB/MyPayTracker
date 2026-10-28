# MOV-01jm — Plan

## Base
spec.md de esta carpeta. Reutiliza `TransactionsPanel`, `formatMoney`, `costaRicaMonth` (DASH-01jm).

## Módulos

### 1. Dominio (`src/domain/movementFilter.ts`)
- Tipo `MovementFilter = { from: string | null; to: string | null; direction: 'all' | 'in' | 'out' }`
  con fechas `YYYY-MM-DD`.
- `validateFilter(f)` → error si `from > to`.
- `applyFilter(movements, f)`: `from` → `YYYY-MM-DDT00:00:00-06:00` inclusivo; `to` → día siguiente
  00:00 −06:00 exclusivo; filtra dirección.
- `filterTotals(movements)` → por moneda `{ incomeCents, expenseCents, netCents }`.
- `presetRange(preset, now)` → `{ from, to }` para este mes, mes pasado, últimos 7 días, todo.
- Pruebas con bordes: 23:59 CR del último día entra; 00:00 CR del día siguiente no.

### 2. UI (`src/ui/transactions/`)
- `MovementFilters.tsx`: dos `<input type="date">`, `<select>` de tipo, botones de accesos rápidos,
  error inline con `aria-describedby`.
- `FilterTotals.tsx`: tres cifras (+ verde, − rojo, neto) con texto además del color.
- `TransactionsPanel`: aplica `applyFilter` antes de listar; estado vacío filtrado con "Limpiar filtros".

### 3. Persistencia del filtro
- Estado elevado a `App`/`AppShell` (vive mientras la pestaña está abierta), no en `localStorage`.

## Riesgos
- `listTransactions` no pagina: Supabase devuelve como máximo 1000 filas por defecto; suficiente
  para uso personal; si crece, filtrar en servidor (marcar con comentario `ponytail:`).
- El saldo del Resumen sigue usando la lista completa, no la filtrada.
