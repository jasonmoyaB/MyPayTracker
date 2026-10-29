# TC-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-01jm. Regla ponytail.

## Tareas
- [x] TC-02jm-T01 Prueba + migración `installments` (1|3|6|10|12; ≠1 solo con tarjeta), sin aplicar [supabase/migrations/0008_installments.sql] (AC-5)
  - Evidencia: rojo ENOENT 0008_installments.sql; verde 6/6 en transactions.test.ts; typecheck y test OK.
- [ ] TC-02jm-T02 Prueba + `installmentDues`, `splitCredit` por cuotas con `scheduleCrc`, `nextPayDay`, `dueBy` [src/domain/credit.ts] (AC-1)
- [ ] TC-02jm-T03 Prueba + `recommend` con veredicto si/ajustado/no [src/domain/recommend.ts] (AC-2–AC-4)
- [ ] TC-02jm-T04 `installments` en datos; select "Plazo" en el formulario y etiqueta en la fila [src/data/transactions.ts, src/ui/transactions/*] (AC-5)
- [ ] TC-02jm-T05 Prueba + `AffordCheck` con forma de pago, plata extra y recomendación; límite y aviso mensual en Resumen [src/ui/balance/*, src/ui/dashboard/*] (AC-2–AC-4)
