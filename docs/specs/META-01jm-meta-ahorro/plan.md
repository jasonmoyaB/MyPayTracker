# META-01jm — Plan
## Migración `00NN_savings_goals.sql`
- Tabla con `user_id default auth.uid()`, checks de monto y moneda, índice por `user_id`.
- RLS: select/insert/delete del dueño; update del dueño solo de `saved` (privilegio de columna, como 0011).
## Domain (`src/domain/savings.ts`)
- `goalStatus(goal, now)` → `{ kind: 'done' } | { kind: 'overdue', missingCents } |
  { kind: 'saving', monthlyCents, months }`.
  - Meses = (año·12 + mes de la fecha límite) − (año·12 + mes CR de hoy) + 1.
  - `monthlyCents = ceil((target − saved) / months)` en enteros.
## Data (`src/data/savings.ts`)
- `listGoals`, `addGoal`, `updateGoalSaved(id, cents)`, `deleteGoal(id)`; montos con `centsToNumeric`/`numericToCents`.
## UI
- Opciones: formulario (nombre, monto con `parseAmountToCents`, moneda, `<input type="month">`, ahorrado) y lista
  con "Actualizar ahorrado" y "Borrar" (confirmación como los demás borrados).
- Resumen: `GoalsCard` con `<progress>` + texto, formato de moneda por meta.
## Pruebas
- `savings.test.ts`: AC-1..AC-4.
- `savings.test.ts` (data): mapeo de filas.
- `DashboardView.test.tsx`: AC-5.
## Riesgos
- `<input type="month">` en Safari iOS antiguo: cae a texto; se valida `AAAA-MM` igual.
- El Resumen necesita cargar metas: se cargan en el shell junto a settings/transactions si ahí se cargan los datos.
