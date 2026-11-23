# AUTH-02jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta.

## Tareas
- [x] AUTH-02jm-T01 Prueba + `sessionExpiry` y constantes [src/domain/sessionLimit.ts, src/domain/sessionLimit.test.ts] (AC-3, AC-4)
  - Evidencia: rojo "Cannot find module ./sessionLimit"; verde 7 casos en sessionLimit.test.ts; typecheck/test OK (458 tests).
- [x] AUTH-02jm-T02 Prueba + cliente con `sessionStorage`, limpieza de `sb-*` en localStorage, `signedInAt` en `Session`, `endExpiredSession` que borra local aunque falle [src/data/supabase.ts, src/data/auth.ts, src/data/auth.test.ts] (AC-1, AC-2, AC-6)
  - Evidencia: rojo 6 casos nuevos (auth.test.ts 4, supabase.test.ts 2: storage, signedInAt, borrado sb-*); verde 65 en src/data; typecheck/test OK (464 tests).
- [x] AUTH-02jm-T03 Prueba + `watchSessionLimit` (actividad, intervalo, `visibilitychange`, una sola llamada) [src/ui/sessionLimit.ts, src/ui/sessionLimit.test.ts] (AC-3, AC-4, AC-5) (depende de T01)
  - Evidencia: rojo "Cannot find module ./sessionLimit"; verde 5 casos en src/ui/sessionLimit.test.ts (incluye sesión ya vencida al montar); typecheck/test OK (469 tests).
- [x] AUTH-02jm-T04 Montar en `App`: bloquear con `setSession(null)`, `endExpiredSession`, toast por motivo [src/ui/App.tsx] (AC-3–AC-7) (depende de T02, T03)
  - Evidencia: sin prueba de montaje (no hay DOM ni testing-library; la lógica la cubre T03); mensajes por motivo en `EXPIRED_MESSAGE`; typecheck/test/build OK (469 tests).

## Correcciones de revisión
- [ ] AUTH-02jm-T05 Probar los textos de aviso por motivo (AC-3, AC-4) sin montar React; quitar el `.catch` redundante de `toUiError`; comentario `ponytail:` del reloj del dispositivo en el máximo [src/ui/App.tsx o src/ui/sessionLimit.ts, src/ui/sessionExpiry.ts]
