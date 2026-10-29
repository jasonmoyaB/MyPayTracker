# TC-04jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de TC-01jm y TC-02jm. Regla ponytail.

## Tareas
- [ ] TC-04jm-T01 Prueba + migración: `installments between 1 and 12`, sin aplicar [supabase/migrations/0009_installments_restantes.sql]
- [ ] TC-04jm-T02 Prueba + `ongoingPurchase` (cuotas restantes y primera cuota en el próximo 20) [src/domain/credit.ts] (AC-1–AC-4)
- [ ] TC-04jm-T03 Prueba + `DebtForm` en el card con validación y recarga; `reload` de App → DashboardView → CreditCard [src/ui/dashboard/*, src/ui/App.tsx] (AC-1, AC-5)
