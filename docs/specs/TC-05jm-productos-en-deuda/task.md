# TC-05jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-04jm. Regla ponytail. Tarea chica: sin agentes.

## Tareas
- [x] TC-05jm-T01 Prueba + `ongoingPurchase` con cuota mensual y `pendingPurchases` [src/domain/credit.ts] (AC-1, AC-3)
  - Evidencia: rojo "pendingPurchases is not a function" y AC-3 con 1 cuota; verde credit.test.ts 23/23; typecheck y test OK.
- [ ] TC-05jm-T02 Prueba + campo "Cuánto pagas por mes" en `DebtForm` [src/ui/dashboard/DebtForm.tsx] (AC-3, AC-4)
- [ ] TC-05jm-T03 Prueba + lista de productos y "Total a pagar el 20" en `CreditCard` [src/ui/dashboard/*] (AC-1, AC-2)
