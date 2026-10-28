# DASH-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-01jm, UX-02jm y AUTH-01jm.

## Tareas
- [x] DASH-01jm-T01 Prueba + `monthStats`, `topExpenses`, `lastEmailMovement`, `costaRicaMonth` [src/domain/monthStats.ts, src/domain/monthStats.test.ts] (AC-3, AC-4, AC-6)
  - Evidencia: rojo "Failed to load url ./monthStats"; verde 8 pruebas en monthStats.test.ts; typecheck, test y build OK.
- [x] DASH-01jm-T02 Prueba + `parseRoute`/`useRoute` + `AppShell` con barra accesible [src/ui/route.ts, src/ui/route.test.ts, src/ui/AppShell.tsx, src/ui/shell.css] (AC-1)
  - Evidencia: rojo "Cannot find module ./route"; verde 10 pruebas en route.test.tsx (.tsx por renderizar AppShell); typecheck, test y build OK.
- [x] DASH-01jm-T03 Prueba + `DashboardView` con saldo, mes, top gastos, últimos 5, última lectura, AffordCheck y vacíos [src/ui/dashboard/*, src/ui/balance/BalancePanel.tsx] (AC-2–AC-7, AC-9) (depende de T01)
  - Evidencia: rojo "Cannot find module ./DashboardView"; verde 7 pruebas en DashboardView.test.tsx (AC-2–AC-7, AC-9); BalancePanel reutiliza summaryFor/BalanceSummary; typecheck, test y build OK.
- [x] DASH-01jm-T04 Prueba + `AccountView` con saldo, salario y cambiar contraseña [src/ui/account/*] (AC-8)
  - Evidencia: rojo "Cannot find module ./AccountView"; verde 3 pruebas en AccountView.test.tsx; `onBack` de ChangePasswordView pasa a opcional (sin "Volver" en Cuenta); typecheck, test y build OK.
- [x] DASH-01jm-T05 `App.tsx` usa `AppShell` con las tres pantallas; quita enlace provisional [src/ui/App.tsx] (AC-1) (depende de T02–T04)
  - Evidencia: rojo App.test.tsx "Element type is invalid" (sin `DashboardBody` exportado); verde 5 pruebas (Resumen, Movimientos, Cuenta, error, cargando); se borra BalancePanel.tsx (sin uso); typecheck, test y build OK.

## Correcciones de revisión
- [x] DASH-01jm-T06 Al cambiar de sección: scroll arriba y foco al h2 de la pantalla (tabIndex -1); regla móvil de `.toasts` con especificidad propia; quitar `export` de `BalanceSummary`; aviso de saldo negativo neutro ("tus gastos superan tu saldo") [src/ui/AppShell.tsx, src/ui/route.ts, src/ui/shell.css, src/ui/dashboard/BalanceCard.tsx, pantallas con h2]
  - Evidencia: rojo 7 fallos en screenFocus.test.tsx (sin `showScreenTop`, h2 sin tabindex, sin `.app-shell ~ .toasts`, aviso con "salario"); verde 7 pruebas; AppShell enfoca el h2 solo al cambiar de sección; typecheck, test y build OK.
