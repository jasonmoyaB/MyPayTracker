# MAIL-02jm — Aviso de correo del BAC que no se pudo leer
## Objetivo
Si el BAC cambia el formato del correo, el parser no lo reconoce y el movimiento se pierde en silencio. El saldo
queda mal y no me entero.
## Requisitos
- Cuando el cron baja un correo del BAC que parece un movimiento (trae un monto) y el parser no lo lee, me llega
  un push "No pude leer un correo del BAC del 27 nov: regístralo a mano".
- Cada correo avisa una sola vez y no se vuelve a descargar en cada pasada.
- Los correos que no son movimiento a propósito (SINPE rechazado, avisos sin monto) no avisan.
## Restricciones
- Migración nueva: tabla `unread_bank_emails(email_message_id text primary key, user_id, received_at, created_at)`
  con RLS del dueño (solo lectura para él; escribe el cron con service_role). Sin cuerpo del correo (datos sensibles).
- Idempotente: upsert con `ignoreDuplicates`; solo las filas nuevas avisan.
- La detección de "parece movimiento" es pura y se prueba con fixtures anonimizados.
## Criterios de aceptación
- AC-1: correo BAC con "Monto: CRC 12,500.00" en un formato que el parser no conoce → se guarda y avisa una vez.
- AC-2: la pasada siguiente no lo descarga ni avisa otra vez.
- AC-3: SINPE rechazado (fixture real) → no avisa.
- AC-4: correo sin monto → no avisa (pero tampoco se re-descarga).
## Supuestos
- Sin pantalla para listar los correos ilegibles: el push basta; se agrega si hace falta.
- Sin fallback de IA (no existe hoy en el cron): queda fuera.
