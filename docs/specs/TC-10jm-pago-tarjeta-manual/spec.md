# TC-10jm — La deuda de la tarjeta baja solo cuando yo pago
## Objetivo
Hoy cada cuota se da por pagada sola a las 00:00 del 20, aunque el dev no haya pagado. La deuda debe bajar solo cuando él marque que pagó. Además, Recordatorios muestra otra cifra que el Resumen.
## Requisitos
- Una cuota vencida y sin marcar sigue en la deuda total, en "Pagas el 20" y en lo que reserva "¿Puedo comprar esto?" (app y conector MCP).
- Botón "Ya pagué" en el card de tarjeta (Resumen) y en la fila de la tarjeta en Recordatorios. Pide confirmación con fecha y monto y marca pagado el pago pendiente más antiguo (el 20 más temprano), CRC y USD de ese día.
- Solo se marca un pago cuyo corte (día 6) ya pasó: así una compra registrada después no queda pagada sin pagarla.
- Recordatorios, campana y Resumen usan el mismo cálculo: la fila de la tarjeta muestra lo que pagas el próximo 20 (con lo atrasado) y la deuda total, las mismas cifras del Resumen.
## Restricciones
- Una migración nueva (`0013`); RLS de `settings` sin cambios. Sin tablas nuevas.
- Centavos enteros; CRC y USD nunca se suman.
## Criterios de aceptación
- AC-1: cuota de ₡10 000 el 20 nov, hoy 20 nov sin marcar → deuda total y "Pagas el 20 nov" siguen con ₡10 000; "Puedes gastar" no sube.
- AC-2: tras "Ya pagué" → esa cuota sale de la deuda y pasa a gasto del 20 nov (como hoy).
- AC-3: 25 nov sin marcar el 20 nov → "Pagas el 20 dic" incluye la cuota atrasada de nov.
- AC-4: Recordatorios muestra para la tarjeta el mismo "Pagas" y "Deuda total" que el Resumen; la campana avisa ese mismo "Pagas".
- AC-5: usuario sin marca guardada (nuevo) → se comporta como hoy (por fecha) hasta su primer "Ya pagué".
## Supuestos
- El pago es del ciclo entero (sin pagos parciales); la transferencia no se registra como gasto aparte (contaría doble): se marca con el botón.
- Al aplicar `0013`, los 20 anteriores a la fecha CR de ese día quedan pagados; el de ese mismo día, no.
- Sin "deshacer" (como REC-02jm); `confirm()` evita el toque por error.
- El push del cron (`sync-bac-emails/reminders.ts`) sigue con `dueOn`: puede avisar un 20 ya pagado por adelantado. Se corrige si molesta.
- El saldo de Cuenta se actualiza después de pagar la tarjeta, no antes (el gasto queda fechado el 20).
