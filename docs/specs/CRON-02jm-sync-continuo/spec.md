# CRON-02jm — Sincronización continua y más rápida

## Problema
La sincronización solo lee octubre 2026: desde el 1 de noviembre dejan de entrar correos nuevos. Además corre cada hora y la pantalla solo se actualiza al recargar, así que un pago nuevo puede tardar más de una hora en verse.

## Objetivo
Leer los correos BAC sin fecha de fin y ver un pago nuevo en la app en pocos minutos, sin recargar.

## Requisitos de usuario
- Que se lean todos los correos BAC nuevos, para siempre, sin cambiar nada cada mes.
- Que un pago nuevo aparezca en la app abierta en minutos.

## Criterios de aceptación
- AC-1: se leen los correos BAC desde el 1 de octubre de 2026 en adelante, sin fecha de fin.
- AC-2: correos ya guardados no se vuelven a descargar ni se duplican; el costo de cada corrida no crece con los meses.
- AC-3: la sincronización corre cada 5 minutos.
- AC-4: con la app abierta, los datos se recargan solos cada minuto y al volver a la pestaña.
- AC-5: con la pestaña oculta no se hacen recargas.
- AC-6: un pago nuevo se ve en la app en ≤ 6 minutos sin recargar a mano.

## Restricciones
- Se mantiene la autorización por clave secreta del cron (CRON-01jm AC-3/AC-4).
- Sin dependencias nuevas.

## Fuera de alcance
Avisos push de Gmail en tiempo real, notificaciones en el celular, historial anterior a octubre 2026.

## Supuestos
- Inicio en 1 oct 2026: lo anterior ya está reflejado en el saldo de cuenta (BAL-01jm).
- 5 minutos es suficiente; bajar a 1 minuto es solo cambiar el horario.
