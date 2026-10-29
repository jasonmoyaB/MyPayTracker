# TC-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-01jm. Regla ponytail.

## Tareas
- [x] TC-02jm-T01 Prueba + migración `installments` (1|3|6|10|12; ≠1 solo con tarjeta), sin aplicar [supabase/migrations/0008_installments.sql] (AC-5)
  - Evidencia: rojo ENOENT 0008_installments.sql; verde 6/6 en transactions.test.ts; typecheck y test OK.
- [x] TC-02jm-T02 Prueba + `installmentDues`, `splitCredit` por cuotas con `scheduleCrc`, `nextPayDay`, `dueBy` [src/domain/credit.ts] (AC-1)
  - Evidencia: rojo "installmentDues/nextPayDay is not a function"; verde 15/15 en credit.test.ts (AC-1, resto en primera cuota, agenda, dueBy); typecheck y test OK.
- [x] TC-02jm-T03 Prueba + `recommend` con veredicto si/ajustado/no [src/domain/recommend.ts] (AC-2–AC-4)
  - Evidencia: rojo "Cannot find module ./recommend"; verde 8/8 (AC-2 por pago y por salario, AC-3 22 % y 44 %, AC-4, agenda previa, efectivo, sin salario); typecheck y test OK (287).
- [x] TC-02jm-T04 `installments` en datos; select "Plazo" en el formulario y etiqueta en la fila [src/data/transactions.ts, src/ui/transactions/*] (AC-5)
  - Evidencia: rojo 2 fallos (sin select "Plazo", fila sin plazo) + 9 errores TS de fixtures sin installments; verde 290 tests; `planLabel` compartido; typecheck y test OK.
- [x] TC-02jm-T05 Prueba + `AffordCheck` con forma de pago, plata extra y recomendación; límite y aviso mensual en Resumen [src/ui/balance/*, src/ui/dashboard/*] (AC-2–AC-4)
  - Evidencia: rojo "Cannot find module ./affordText" y 2 fallos en DashboardView.test (sin aviso de salario ni forma de pago); verde 298 tests (affordText 6, Resumen con pago futuro); prueba TC-01jm AC-2 movida a compra del 25 oct (vence el próximo 20) por la nueva regla del límite; typecheck, test y build OK.
