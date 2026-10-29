# UX-03jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Regla ponytail.

## Tareas
- [x] UX-03jm-T01 Prueba + `PushToggle` de Cuenta a Opciones [src/ui/options/OptionsView.tsx, src/ui/account/AccountView.tsx] (AC-1)
  - Evidencia: rojo 2 fallos (Opciones sin "Notificaciones", Cuenta aún con ella); verde 302 tests; typecheck OK.
- [x] UX-03jm-T02 Prueba + filtros de fecha sin solaparse en móvil/iOS [src/ui/transactions/transactions.css] (AC-2, AC-3)
  - Evidencia: rojo 2 fallos en filters.test.tsx (sin `min(100%` ni `appearance: none`); verde 304 tests; typecheck y build OK.
- [x] UX-03jm-T03 Prueba + quitar el botón de tema del login (el tema vive en Opciones) [src/ui/auth/LoginView.tsx]
  - Evidencia: rojo "document is not defined" (el login aún montaba ThemeToggle); verde 305 tests; typecheck OK.
