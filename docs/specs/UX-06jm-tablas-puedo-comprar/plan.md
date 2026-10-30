# UX-06jm — Plan
## Módulos
1. **`src/ui/balance/PlanTable.tsx`**: ambas tablas con `className="plan-table amount"` (se quitan los estilos en
   línea); plazo corto con un helper local (`1 → "Un pago"`, `n → "n meses"`); encabezado "¿Alcanza?";
   caption "Cuota por plazo (tasa cero)".
2. **`src/ui/balance/plan-table.css`** (importado por `PlanTable.tsx`): padding 6px 8px, borde entre filas,
   `white-space: nowrap`, columnas de monto a la derecha, primera y última columna sin padding exterior y la
   última con `width: 1%` para que no se estire.
## Decisiones
- `planLabel` no cambia: lo usan los selects, donde "Tasa cero" sí aporta.
- Sin media query: con textos cortos y `nowrap` la tabla cabe en móvil y en escritorio igual.
