# AUTH-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta.

## Tareas
- [x] AUTH-02jm-T01 Prueba + `sessionExpiry` y constantes [src/domain/sessionLimit.ts, src/domain/sessionLimit.test.ts] (AC-3, AC-4)
  - Evidencia: rojo "Cannot find module ./sessionLimit"; verde 7 casos en sessionLimit.test.ts; typecheck/test OK (458 tests).
- [ ] AUTH-02jm-T02 Prueba + cliente con `sessionStorage`, limpieza de `sb-*` en localStorage, `signedInAt` en `Session`, `endExpiredSession` que borra local aunque falle [src/data/supabase.ts, src/data/auth.ts, src/data/auth.test.ts] (AC-1, AC-2, AC-6)
- [ ] AUTH-02jm-T03 Prueba + `watchSessionLimit` (actividad, intervalo, `visibilitychange`, una sola llamada) [src/ui/sessionLimit.ts, src/ui/sessionLimit.test.ts] (AC-3, AC-4, AC-5) (depende de T01)
- [ ] AUTH-02jm-T04 Montar en `App`: bloquear con `setSession(null)`, `endExpiredSession`, toast por motivo [src/ui/App.tsx] (AC-3–AC-7) (depende de T02, T03)
