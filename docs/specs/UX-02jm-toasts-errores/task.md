# UX-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-01jm (tokens de vidrio).

## Tareas
- [x] UX-02jm-T01 Prueba + `toAppError` por tipo de error [src/data/errors.ts, src/data/errors.test.ts] (AC-3)
  - Evidencia: rojo `Cannot find module ./errors`; verde 17 tests en errors.test.ts; typecheck+test (98)+build OK.
- [x] UX-02jm-T02 Prueba + cola de toasts + `ToastProvider`/`useToast` accesible [src/ui/toast/*] (AC-1, AC-8)
  - Evidencia: rojo `Cannot find module ./toastQueue`; verde 8 tests en toast.test.tsx (cola máx. 3, 4 s, status/alert, cerrar); typecheck+test (106)+build OK.
- [ ] UX-02jm-T03 Toast de éxito/error en saldo, salario y movimientos sin perder lo escrito [src/ui/balance/MoneySetting.tsx, src/ui/transactions/useTransactionForm.ts, src/ui/transactions/TransactionsPanel.tsx] (AC-1, AC-2) (depende de T01, T02)
- [ ] UX-02jm-T04 Sesión vencida → salir con aviso; errores de carga amigables en App y Login [src/ui/App.tsx, src/ui/auth/LoginView.tsx, src/data/auth.ts] (AC-3, AC-4)
- [ ] UX-02jm-T05 ErrorBoundary + config faltante + `unhandledrejection` [src/ui/main.tsx, src/ui/ErrorBoundary.tsx, src/data/supabase.ts] (AC-5, AC-6)
- [ ] UX-02jm-T06 Respuesta de error saneada en la función de sync [supabase/functions/sync-bac-emails/index.ts] (AC-7)
