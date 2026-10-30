# TC-07jm — Fecha de compra y borrar deuda
## Objetivo
"Agregar deuda que ya tenías" no pregunta cuándo se compró, así que el dev tiene que calcular a mano cuánto le
queda. Además, una deuda agregada por error no se puede quitar.
## Requisitos
- El formulario suma "Fecha de compra" (opcional). Con fecha, la app calcula sola: guarda el precio completo al plazo
  elegido desde esa fecha, y las cuotas ya vencidas cuentan como pagadas (regla de TC-01jm/TC-02jm). "Te queda por
  pagar" y "Cuánto pagas por mes" se ocultan porque salen de la fecha.
- Sin fecha, todo sigue como en TC-04jm/TC-05jm.
- En el detalle de cada producto en deuda hay un botón "Eliminar deuda", con confirmación; al borrar, el card se
  actualiza sin recargar.
## Restricciones
- Centavos enteros; solo CRC; RLS intacto (la política de `transactions` ya cubre delete). Sin migración.
- Solo se borra la compra elegida, por su id; nunca otras filas.
## Criterios de aceptación
- AC-1: compra el 10 sep (después del corte), ₡120 000 a 3 meses, hoy 29 oct → la del 20 oct ya pasó y quedan 2 cuotas de ₡40 000 (20 nov y 20 dic).
- AC-2: fecha futura, inválida o una deuda que ya quedó pagada con esa fecha → error y no se guarda.
- AC-3: "Eliminar deuda" pide confirmar y borra solo esa compra; cancelar no borra nada.
## Supuestos
- La fecha va a las 12:00 hora CR, para no caer en el día anterior o siguiente.
- Las cuotas vencidas aparecen como gastos pagados en su 20, igual que una compra registrada a tiempo.
- Las compras con tarjeta solo se registran a mano (el correo guarda efectivo), así que borrar no choca con la sincronización.
