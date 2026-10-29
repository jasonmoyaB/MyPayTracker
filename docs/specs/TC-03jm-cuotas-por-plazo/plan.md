# TC-03jm — Plan
## Dominio
- `src/domain/recommend.ts`
  - `comparePlans(input sin plan)` devuelve `recommend` para cada plazo de `PLANS` salvo `cash`.
  - Es una sola línea sobre lo existente; no hay reglas nuevas.
## UI
- `src/ui/balance/PlanTable.tsx` (nuevo)
  - Tabla con caption "Cuota por plazo".
  - Columnas: Plazo, Cuota al mes, Primer pago y Recomendación.
  - Reutiliza `planLabel`, `formatMoney` y `formatDay`.
  - El veredicto se muestra como Sí / Ajustado / No, con la clase `status-*` que corresponde.
- `src/ui/balance/AffordCheck.tsx`
  - Al calcular guarda también `comparePlans(...)` y monta `PlanTable` debajo del resultado.
  - Si el precio es inválido, no hay tabla.
- `src/ui/balance/affordText.ts`
  - Exporta el mapa veredicto → tono que usa `PlanTable`, para no repetirlo.
## Decisiones
- La tabla aparece siempre que el precio sea válido, no solo con tarjeta: así se compara antes de elegir.
- Va en un archivo aparte para que `AffordCheck` siga por debajo de 150 líneas.
- No se agrega un selector de "plazo recomendado". El dev elige mirando la tabla (YAGNI).
## Pruebas
- `recommend.test.ts`: `comparePlans` devuelve los 5 plazos con las cuotas de AC-1.
- `PlanTable.test.tsx`: caption, encabezados `th scope="col"`, filas con cuota y veredicto (AC-1).
- AC-2 queda cubierto porque `AffordCheck` solo pasa filas cuando el resultado es válido.
## Riesgos
- La tabla puede ser ancha en el teléfono. Se envuelve con `overflow-x: auto`.
