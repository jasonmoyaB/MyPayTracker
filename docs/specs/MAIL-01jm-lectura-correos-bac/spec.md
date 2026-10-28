# MAIL-01jm — Lectura de correos BAC

## Problema
Las compras con tarjeta y los SINPE recibidos llegan por correo de BAC, pero hoy hay que anotarlos a mano.

## Objetivo
Leer los correos de `NotificacionBAC@baccredomatic.cr` (compras) y `notificaciones@baccredomatic.cr` (SINPE) desde Gmail y guardarlos como `transactions` con `source = 'email_regex'`.

## Criterios de aceptación
- AC-1: compra BAC (`Tipo: COMPRA`) → movimiento `out` con comercio, monto en centavos, moneda (CRC/USD) y fecha en hora de Costa Rica (−06:00).
- AC-2: SINPE "se acreditó … Colones/Dólares" → movimiento `in` con monto, moneda, concepto y fecha.
- AC-3: SINPE "fue rechazada", tipos de compra desconocidos o remitentes no reconocidos → `null` (no se guarda).
- AC-4: el cuerpo HTML de Gmail (base64url, multipart) se convierte a texto antes de parsear.
- AC-5: el mismo correo nunca se guarda dos veces (`email_message_id` único).
- AC-6: `transactions` tiene columna `currency` (`CRC` | `USD`).
- AC-7: Edge Function `sync-bac-emails` lista, parsea y hace upsert; las credenciales viven solo en secrets.

## Fuera de alcance
Fallback con IA, conversión USD→CRC, cron, pantalla de movimientos, deploy de la función.

## Supuestos
- No se usa usuario/contraseña de correo: OAuth de Gmail con scope `gmail.readonly` y refresh token en secrets.
- Un solo dueño: `OWNER_USER_ID` en secrets. La función usa service role solo del lado del servidor.
- BAC no notifica por correo los SINPE salientes exitosos (solo los rechazados), así que no se registran.
- La tarjeta MASTER del correo se trata como gasto (`out`). Si es de crédito, no hay que anotarla además a mano (sería doble).
- `canAfford` sigue sumando un solo monto; separar por moneda queda para otra spec.
