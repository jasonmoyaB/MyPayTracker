# AUTH-01jm — Plan

## Base
spec.md de esta carpeta; `src/data/auth.ts` (signIn/signOut/onSessionChange), `LoginView`. Depende de UX-02jm (toasts, errores).

## Módulos

### 1. Validación (`src/domain/password.ts`)
- `validatePasswordChange({ current, next, confirm })` → errores por campo:
  actual vacía, nueva < 8, confirmación distinta, nueva igual a la actual.
- Pura, probada con tabla de casos.

### 2. Datos (`src/data/auth.ts`)
- `changePassword(email, current, next)`:
  1. `signInWithPassword({ email, password: current })`; si falla por credenciales → error tipo `credentials`.
  2. `auth.updateUser({ password: next })`.
- Errores pasan por `toAppError` (UX-02jm).

### 3. Componente `PasswordInput` (`src/ui/auth/PasswordInput.tsx`)
- `<input>` + botón `type="button"` con icono SVG inline de ojo / ojo tachado.
- `aria-label` alterna "Mostrar contraseña"/"Ocultar contraseña"; `aria-pressed`; área táctil ≥ 44 px.
- Recibe props estándar de input (id, autocomplete, required) para reutilizarse.

### 4. Pantallas
- `LoginView`: el input de contraseña pasa a `PasswordInput`.
- `ChangePasswordView` (`src/ui/auth/ChangePasswordView.tsx`): tres `PasswordInput`
  (`autocomplete` current-password / new-password), errores inline con `aria-describedby`,
  botón deshabilitado al guardar, toast de éxito y limpieza.
- Montaje provisional: enlace "Cambiar contraseña" en el encabezado de `App`; DASH-01jm lo mueve a "Cuenta".

## Riesgos
- Supabase puede exigir reautenticación según la configuración del proyecto; la verificación previa la cubre.
- El re-login emite un evento de sesión: `onSessionChange` no debe desmontar la pantalla (mismo usuario).
