# UX-02jm — Toasts de confirmación y manejo de errores

## Problema
Al editar saldo o salario no hay confirmación visible, y varios errores muestran mensajes técnicos de Supabase o rompen la pantalla sin explicación.

## Objetivo
Confirmar cada guardado con un aviso breve (toast) y mostrar siempre errores claros, en español, con una salida (reintentar, volver a entrar).

## Requisitos de usuario
- Ver "Saldo actualizado", "Salario actualizado", "Movimiento guardado", etc. al guardar.
- Nunca ver mensajes técnicos ni una pantalla en blanco.

## Criterios de aceptación
- AC-1: cada guardado exitoso (saldo, salario, movimiento, contraseña) muestra un toast de éxito que se cierra solo a los 4 s o con un botón.
- AC-2: un error al guardar muestra un toast de error con mensaje amigable y conserva lo escrito en el formulario.
- AC-3: los errores se traducen por tipo: sin conexión, sesión vencida, credenciales inválidas, permiso denegado, dato inválido, error desconocido.
- AC-4: con sesión vencida se pide volver a iniciar sesión, sin quedar en un estado roto.
- AC-5: un error inesperado de render muestra una pantalla de recuperación con "Recargar", no una pantalla en blanco.
- AC-6: si faltan las variables de Supabase se muestra un mensaje claro en vez de romper al cargar.
- AC-7: la sincronización de correos no devuelve detalles internos (tokens, cuerpos de Google) en su respuesta de error.
- AC-8: los toasts son accesibles: éxito como `status`, error como `alert`.

## Restricciones
- Sin dependencias nuevas. Capas intactas (`src/architecture.test.ts`).

## Fuera de alcance
Servicio externo de monitoreo de errores (Sentry), reintentos automáticos.

## Supuestos
- Máximo 3 toasts visibles; los más viejos se descartan.
- El despliegue de la función sincronizadora queda pendiente para el usuario (sin cambios remotos).
