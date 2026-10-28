# AUTH-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-02jm.

## Tareas
- [ ] AUTH-01jm-T01 Prueba + `validatePasswordChange` [src/domain/password.ts, src/domain/password.test.ts] (AC-4)
- [ ] AUTH-01jm-T02 Prueba + `PasswordInput` con ojo accesible; usarlo en LoginView [src/ui/auth/PasswordInput.tsx, src/ui/auth/PasswordInput.test.tsx, src/ui/auth/LoginView.tsx] (AC-1)
- [ ] AUTH-01jm-T03 `changePassword` verifica la actual y actualiza [src/data/auth.ts] (AC-3)
- [ ] AUTH-01jm-T04 Prueba + `ChangePasswordView` con errores inline, bloqueo y toast; enlace en App [src/ui/auth/ChangePasswordView.tsx, src/ui/auth/ChangePasswordView.test.tsx, src/ui/App.tsx] (AC-2, AC-4, AC-5, AC-6) (depende de T01–T03)
