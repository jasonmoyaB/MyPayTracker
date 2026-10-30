# MCP-03jm — Cambiar salario y saldo desde Claude o ChatGPT

## Objetivo
Decirle al asistente "cambia mi salario mensual a 300 mil colones" o "mi saldo actual en BAC es
₡250 000" y que la app quede actualizada, igual que si lo cambiara en Cuenta.

## Requisitos de usuario
1. El conector suma `cambiar_salario` y `cambiar_saldo`, con el monto en colones.
2. El saldo se registra con la fecha de ahora: desde ahí se suman los movimientos posteriores,
   igual que en Cuenta.
3. La respuesta confirma el valor guardado.
4. La pantalla de consentimiento dice que el asistente puede ver movimientos y cambiar saldo y salario.

## Restricciones críticas
- Mismas reglas que Cuenta: monto en colones mayor que cero con hasta 2 decimales (`parseAmountToCents`),
  como máximo lo que cabe en `numeric(12,2)`.
- Se escribe como el usuario que aprobó (RLS, `user_id` del token), nunca con `service_role` ni con
  un `user_id` que mande el asistente.
- No se borra ni se edita ningún movimiento.

## Criterios de aceptación
- AC-1: `cambiar_salario { monto: "300000" }` guarda `salary = 300000.00` y lo confirma.
- AC-2: `cambiar_saldo { monto: "250000" }` guarda `account_balance = 250000.00` con fecha de ahora.
- AC-3: monto inválido, cero, negativo o enorme → `isError` sin escribir.
- AC-4: si la escritura falla, `isError` con texto genérico; el detalle solo al log.
- AC-5: las herramientas de escritura se marcan `readOnlyHint: false` y `destructiveHint: true`
  (reemplazan el valor anterior), para que Claude/ChatGPT pidan confirmación.

## Supuestos (criterio conservador)
- "etc" se limita a salario y saldo. Registrar movimientos o recordatorios queda fuera: crearlos dos
  veces por un reintento duplicaría gastos (no hay clave idempotente). Borrar, nunca.
- El asistente convierte "300 mil" en "300000"; el servidor solo acepta el formato de Cuenta.
- Cero y negativos se rechazan, como en Cuenta.
- Las conexiones ya aprobadas siguen valiendo; el texto nuevo aplica a las siguientes.
