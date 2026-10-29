# REC-01jm — Recordatorios de pagos
## Objetivo
El dev no sabe cuándo le toca pagar algo ni cuándo se acerca la fecha. Quiere una pantalla de Recordatorios con sus
pagos mensuales (p. ej. Spotify ₡2 000 cada mes) y el pago de la tarjeta, y una notificación push antes y el día.
## Requisitos
- Nueva sección "Recordatorios" en la barra de navegación.
- Agregar un recordatorio mensual: descripción, monto, moneda (CRC/USD) y día del mes (1–31). Se pueden borrar.
  Si la descripción habla de la tarjeta ("pagar tarjeta", "crédito", "TC"…), el monto ofrece "Usar deuda actual":
  llena lo que vence el próximo 20 de la tarjeta (CRC). Esos recordatorios y la fila de la tarjeta abren un modal
  con toda la deuda, el pago de cada mes y, por producto, cuánto paga al mes y lo que falta (`<dialog>` de TC-06jm).
- La pantalla lista cada recordatorio con su próxima fecha y monto, y arriba el pago de la tarjeta: "Tarjeta de
  crédito · 20 nov · ₡30 666,70" (lo que vence ese 20, de las compras registradas). Sin deuda, no aparece.
- Push (a los dispositivos con notificaciones activas): 3 días antes ("Spotify: vence en 3 días, ₡2 000") y el día
  ("Spotify: vence hoy, ₡2 000"). Igual para la tarjeta el 17 y el 20. Tocarla abre Recordatorios.
- Cada aviso sale una sola vez por fecha aunque el cron corra cada 5 minutos.
- Campana en el encabezado con la cantidad de pagos que vencen en 0–3 días (recordatorios y tarjeta); al tocarla
  lista "Spotify: vence mañana, ₡2 000" y lleva a Recordatorios. Se calcula al abrir la app (no guarda historial).
## Restricciones
- Centavos enteros; CRC y USD nunca se suman (el aviso de tarjeta menciona USD aparte si lo hay).
- Tabla nueva con RLS del dueño; migración nueva `0010`; sin dependencias; sin `db push` ni cambios remotos.
- Reutiliza el push existente (suscripciones, VAPID, service worker) y el cron de `sync-bac-emails`.
## Criterios de aceptación
- AC-1: Spotify día 15, hoy 29 oct → próxima 15 nov; día 31 en noviembre → 30 nov; en febrero → 28/29.
- AC-2: hoy 12 nov (≥ 8:00 CR) → aviso "en 3 días"; 15 nov → "vence hoy"; 13 y 14 nov → nada.
- AC-3: dos corridas del cron el mismo día envían un solo aviso por recordatorio.
- AC-4: tarjeta con cuotas de ₡10 000 y ₡20 666,70 el 20 nov → pantalla y aviso del 17 y 20 nov con ₡30 666,70.
- AC-5: si Gmail falla, los recordatorios igual se envían.
- AC-6: un usuario no ve ni borra recordatorios de otro (RLS).
## Supuestos
- Solo frecuencia mensual. Días 29–31 caen en el último día de los meses cortos.
- Anticipación fija de 3 días y avisos desde las 8:00 CR (no de madrugada); constantes del dominio.
- Si el cron no corre justo ese día, ese aviso se pierde (como el push actual: sin reintentos).
- Recordatorio no es movimiento: no cambia saldo ni deuda. Editar = borrar y crear (sin edición en esta entrega).
- `docs/mapa-de-la-app.md` no existe; se siguió la navegación por hash y las pantallas actuales.
