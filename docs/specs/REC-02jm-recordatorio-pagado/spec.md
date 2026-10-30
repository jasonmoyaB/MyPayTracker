# REC-02jm — Marcar un recordatorio como pagado
## Objetivo
La campana y los push avisan de un pago aunque el dev ya lo hizo. Quiere marcarlo como pagado y que deje de avisar.
## Requisitos
- Cada recordatorio de la pantalla Recordatorios tiene un botón "Pagado".
- Al tocarlo, ese vencimiento queda pagado: la lista, la campana y los push pasan al vencimiento del mes siguiente.
- El mes siguiente vuelve a avisar normal, sin hacer nada.
## Restricciones
- Una migración nueva (`0011`); RLS: el dueño solo puede cambiar la marca de pagado, nada más de la fila.
- Sin tablas nuevas ni historial de pagos. No toca saldo ni movimientos.
## Criterios de aceptación
- AC-1: Spotify día 1, hoy 29 oct, sin pagar → próximo pago 1 nov y la campana avisa "vence en 3 días".
- AC-2: tras "Pagado" → próximo pago 1 dic; la campana no lo muestra y el cron no manda push del 1 nov.
- AC-3: llega nov y se pasa el 1 dic → avisa el 28 nov y el 1 dic como siempre.
## Supuestos
- "Pagado" marca el vencimiento próximo (el que muestra la lista), aunque falten días.
- Sin "deshacer": si se marca por error, borrar y crear de nuevo (como editar hoy).
- La fila automática "Tarjeta de crédito" no se marca: desaparece sola cuando splitCredit da la cuota por pagada.
