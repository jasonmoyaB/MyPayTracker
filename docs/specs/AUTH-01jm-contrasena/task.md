# AUTH-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-02jm.

## Tareas
- [x] AUTH-01jm-T01 Prueba + `validatePasswordChange` [src/domain/password.ts, src/domain/password.test.ts] (AC-4)
  - Evidencia: rojo "Cannot find module ./password"; verde 8 casos en password.test.ts; typecheck/test/build OK.
- [x] AUTH-01jm-T02 Prueba + `PasswordInput` con ojo accesible; usarlo en LoginView [src/ui/auth/PasswordInput.tsx, src/ui/auth/PasswordInput.test.tsx, src/ui/auth/LoginView.tsx] (AC-1)
  - Evidencia: rojo "Cannot find module ./PasswordInput"; verde 4 casos en PasswordInput.test.tsx (+ estilos en src/ui/auth/auth.css); typecheck/test/build OK.
- [x] AUTH-01jm-T03 `changePassword` verifica la actual y actualiza [src/data/auth.ts] (AC-3)
  - Evidencia: rojo "changePassword is not a function"; verde 3 casos en src/data/auth.test.ts (nuevo); typecheck/test/build OK.
- [x] AUTH-01jm-T04 Prueba + `ChangePasswordView` con errores inline, bloqueo y toast; enlace en App [src/ui/auth/ChangePasswordView.tsx, src/ui/auth/ChangePasswordView.test.tsx, src/ui/App.tsx] (AC-2, AC-4, AC-5, AC-6) (depende de T01–T03)
  - Evidencia: rojo "Cannot find module ./ChangePasswordView"; verde 7 casos en ChangePasswordView.test.tsx; App con botón "Cambiar contraseña"/"Volver"; typecheck/test/build OK (139 tests).
