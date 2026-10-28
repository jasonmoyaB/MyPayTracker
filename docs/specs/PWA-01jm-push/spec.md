# PWA-01jm — App instalable y notificaciones push

## Problema
La app solo se usa en el navegador y no avisa cuando entra o sale dinero; hay que abrirla para enterarse.

## Objetivo
Poder instalar la web en el teléfono como app y recibir una notificación push por cada ingreso o gasto leído del correo.

## Requisitos de usuario
- Instalar MyPayTracker en la pantalla de inicio del teléfono con su icono.
- Recibir una notificación en el teléfono cuando el correo BAC registra una entrada o salida.
- Poder activar y desactivar las notificaciones desde Cuenta.
## Criterios de aceptación
- AC-1: la app es instalable (manifest con nombre, iconos 192/512 y modo standalone, más service worker).
- AC-2: en Cuenta, "Activar notificaciones" pide permiso solo al tocarlo y guarda la suscripción de ese dispositivo.
- AC-3: el estado se muestra: activas, desactivadas, bloqueadas por el navegador o no soportadas (en iPhone indica que primero hay que instalarla).
- AC-4: "Desactivar" borra la suscripción de ese dispositivo.
- AC-5: cada movimiento nuevo leído del correo envía una notificación: "Ingreso" o "Gasto", monto con moneda y descripción.
- AC-6: un correo ya procesado nunca genera una segunda notificación.
- AC-7: tocar la notificación abre la app en Movimientos.
- AC-8: las suscripciones solo son visibles para su dueño (RLS); la clave privada de push vive solo en secrets del servidor.
- AC-9: suscripciones vencidas (el navegador las rechaza) se borran solas.
## Restricciones
- Sin cambios remotos en esta entrega: migración, secrets y despliegues quedan como pasos para el usuario.
## Fuera de alcance
Notificar movimientos manuales, modo sin conexión, resumen diario.
## Supuestos
- Los movimientos manuales no notifican (los registra el propio usuario).
- Si el envío de push falla, el movimiento igual se guarda; la notificación se pierde (sin reintentos).
