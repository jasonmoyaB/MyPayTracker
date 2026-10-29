# TC-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Regla ponytail: reutilizar lo existente, sin dependencias ni abstracciones nuevas.

## Tareas
- [x] TC-01jm-T01 Prueba + migración `payment_method` (cash|credit, credit solo gasto), sin aplicar [supabase/migrations/0007_payment_method.sql] (AC-4)
  - Evidencia: rojo ENOENT 0007_payment_method.sql en transactions.test.ts; verde 2/2; typecheck y test OK (254).
- [x] TC-01jm-T02 Prueba + `creditDueAt`, `nextCreditDates`, `splitCredit` [src/domain/credit.ts, src/domain/credit.test.ts] (AC-1, AC-2, AC-3, AC-5)
  - Evidencia: rojo "Cannot find module ./credit" en credit.test.ts; verde 9/9 (AC-1 + borde 05:59Z, AC-2/3, AC-5); typecheck y test OK (263).
- [x] TC-01jm-T03 `paymentMethod` en `Transaction`/`NewTransaction`, lectura e inserción [src/data/transactions.ts] (AC-4) (depende de T01)
  - Evidencia: rojo 2 fallos en transactions.test.ts (select sin payment_method, insert sin payment_method); verde 4/4; fixtures con paymentMethod cash y el formulario guarda cash hasta T04; typecheck y test OK (265).
- [ ] TC-01jm-T04 Prueba + select "Método de pago" (solo gasto) y etiqueta "Tarjeta · se paga el …" en la fila [src/ui/transactions/*] (AC-4) (depende de T02, T03)
- [ ] TC-01jm-T05 Prueba + `summaryFor` con `splitCredit`, `CreditCard` (corte, pago, deuda, límite, quiebra) y `AffordCheck` con el límite [src/ui/dashboard/*] (AC-2, AC-3) (depende de T02, T03)
