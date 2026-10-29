# NAV-02jm — Sección "Opciones"

## Objetivo
Juntar en una sola sección los ajustes de la app y de la sesión, para que el encabezado quede limpio
y "Cuenta" muestre solo lo que es de dinero y notificaciones.

## Requisitos
- Nueva sección "Opciones" en la barra de navegación (cuarta, después de Cuenta), con su icono.
- Opciones reúne:
  - El tema claro/oscuro.
  - Cambiar contraseña.
  - El correo de la sesión y "Cerrar sesión".
- El encabezado deja de mostrar el correo, el tema y "Cerrar sesión".
- "Cuenta" conserva saldo, salario y notificaciones; ya no muestra cambiar contraseña.
- Se llega por `#/opciones`; al entrar se enfoca el primer título, como en las demás secciones.

## Restricciones
- Sin dependencias nuevas. Se reutilizan `ThemeToggle`, `ChangePasswordView` y `signOut` tal cual.
- Accesible: nombre accesible en la barra, `aria-current`, objetivos táctiles ≥ 44px.
- La barra inferior móvil (NAV-01jm) debe seguir cabiendo con cuatro secciones a 360px de ancho.

## Criterios de aceptación
- AC-1: la barra tiene cuatro enlaces; `#/opciones` abre Opciones.
- AC-2: Opciones muestra el botón de tema, el formulario "Cambiar contraseña", el correo y "Cerrar sesión".
- AC-3: Cuenta ya no incluye "Cambiar contraseña".
- AC-4: el primer h2 de Opciones es enfocable por código (`tabindex="-1"`).

## Supuestos
- Icono de Opciones: engranaje.
- Las notificaciones se quedan en Cuenta.
