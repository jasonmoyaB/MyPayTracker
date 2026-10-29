# TC-05jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-04jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] TC-05jm-T01 Prueba + `ongoingPurchase` con cuota mensual y `pendingPurchases` [src/domain/credit.ts] (AC-1, AC-3)
  - Evidencia: rojo "pendingPurchases is not a function" y AC-3 con 1 cuota; verde credit.test.ts 23/23; typecheck y test OK.
- [x] TC-05jm-T02 Prueba + campo "Cuánto pagas por mes" en `DebtForm` [src/ui/dashboard/DebtForm.tsx] (AC-3, AC-4)
  - Evidencia: rojo 2 fallos (sin campo "Cuánto pagas por mes", checkDebt sin monthlyCents); verde DebtForm.test.tsx 4/4; typecheck y test OK.
- [x] TC-05jm-T03 Prueba + lista de productos y "Total a pagar el 20" en `CreditCard` [src/ui/dashboard/*] (AC-1, AC-2)
  - Evidencia: rojo "no contiene Total a pagar el 20 nov"; verde DebtForm.test.tsx 5/5 y suite completa; typecheck, test y build OK.
- [x] TC-05jm-T04 Prueba + la fila dice "próxima <monto> el <fecha>" (`nextDueAt` en `pendingPurchases`) [src/domain/credit.ts, src/ui/dashboard/CreditCard.tsx] (AC-1)
  - Evidencia: rojo 2 fallos (sin nextDueAt, fila "próxima de"); verde 319/319; typecheck y test OK.
