# SIM-01jm — Plan
## Módulos
1. **Dominio (`src/domain/recommend.ts`)**
   - `Recommendation` gana `monthly: { dueAt; cuotasCents; freeCents | null }[]` (vacío en efectivo).
   - Se arma con el `schedule` que `recommend` ya construye (agenda previa + cuotas nuevas): una fila por cada
     `dueAt` de la compra nueva.
   - Fila con `dueAt <= payDay`: `freeCents = leftCents` (sale del saldo, misma regla de hoy).
   - Filas posteriores: `freeCents = salaryCents − schedule[dueAt]`, o `null` sin salario.
   - `comparePlans` lo hereda sin cambios.
2. **UI (`src/ui/balance/PlanTable.tsx`)**
   - Nuevo `MonthTable({ rows })` junto a `PlanTable`: reutiliza `formatMoney`, `formatDay` y la clase `status-danger`
     para los negativos. Sin estado ni lógica.
   - `AffordCheck` lo pinta debajo del mensaje cuando el resultado trae `monthly` no vacío.
3. **Estilo**: el contenedor con `overflow-x: auto` de `PlanTable` ya resuelve el móvil; sin CSS nuevo.
4. **Gasto promedio (T03)**: `avgMonthlySpend` en `src/domain/monthStats.ts`; `recommend` recibe `spendCents`
   (opcional, 0) y lo resta solo en los meses del salario; `DashboardView` lo calcula y `MonthTable` lo anota en el caption.
## Decisiones
- Se calcula en el mismo recorrido de `recommend` para no duplicar la regla "próximo 20 del saldo, el resto del salario".
- Se muestran solo los meses de la compra nueva: es lo que la compra cambia; otros meses ya se ven en el card de tarjeta.
- Sin dependencias, sin migraciones, sin cambios en `data/`.
## Pruebas
- `recommend.test.ts`: AC-1, AC-2 (dominio), AC-3 (null sin salario), efectivo → `monthly` vacío.
- `PlanTable.test.tsx`: `MonthTable` con caption, encabezados, "—" y `status-danger`.
