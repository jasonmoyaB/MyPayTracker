# AUTH-01jm — Ver contraseña y cambiar contraseña

## Problema
En el login no se puede ver lo que se escribe en la contraseña, y no hay forma de cambiarla desde la app.

## Objetivo
Botón de ojo para mostrar u ocultar la contraseña, y una pantalla para cambiarla de forma segura.

## Requisitos de usuario
- En el login, un ojo que muestre u oculte la contraseña.
- Una pantalla "Cambiar contraseña" con contraseña actual, nueva y confirmación.

## Criterios de aceptación
- AC-1: el campo contraseña del login tiene un botón de ojo que alterna entre oculto y visible; su nombre accesible dice "Mostrar contraseña"/"Ocultar contraseña" y se alcanza con teclado.
- AC-2: los tres campos de la pantalla de cambio también tienen ojo.
- AC-3: para cambiarla se exige la contraseña actual correcta; si es incorrecta se avisa y no cambia nada.
- AC-4: la nueva debe tener al menos 8 caracteres, coincidir con la confirmación y ser distinta de la actual; cada error se muestra junto a su campo.
- AC-5: al cambiarla con éxito se muestra un toast "Contraseña actualizada" y se limpian los campos.
- AC-6: mientras se guarda, el botón queda deshabilitado y no se envía dos veces.

## Restricciones
- Sin tabla propia: se usa Supabase Auth.
- La UI no importa el SDK de Supabase (`src/architecture.test.ts`).

## Fuera de alcance
"Olvidé mi contraseña" por correo, cerrar otras sesiones.

## Supuestos
- La contraseña actual se verifica volviendo a iniciar sesión con ella antes de cambiarla.
- La pantalla vive en "Cuenta" (DASH-01jm); hasta entonces se monta desde el encabezado.
