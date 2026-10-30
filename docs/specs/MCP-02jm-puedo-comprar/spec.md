# MCP-02jm — "¿Puedo comprar esto?" desde Claude o ChatGPT

## Objetivo
Preguntarle al asistente "¿puedo comprar unas Samba Adidas de ₡80 000 con tarjeta a 3 meses?" y
recibir la misma recomendación que da "¿Puedo comprar esto?" en el Resumen de la app.

## Requisitos de usuario
1. El conector MCP-01jm suma la herramienta `puedo_comprar` con: precio en colones, forma de pago
   (contado/débito, tarjeta en un pago, o tasa cero a 3, 6, 10 o 12 meses) y plata extra opcional.
2. La respuesta trae el veredicto (sí / ajustado / no) y su razón, la cuota y la fecha del primer
   pago, lo que queda hoy, el porcentaje del salario y, mes a mes, lo que queda libre.

## Restricciones críticas
- Solo lectura: no registra la compra.
- Mismo cálculo que la app: saldo, tarjeta pendiente, salario y gasto promedio salen de la misma
  lógica de dominio que usa el Resumen; nada se recalcula aparte.
- Solo CRC; centavos enteros; datos leídos con el JWT del usuario (RLS).

## Criterios de aceptación
- AC-1: para iguales datos e iguales parámetros, `puedo_comprar` devuelve el mismo veredicto, cuota
  y montos que `recommend` con las entradas que arma el Resumen.
- AC-2: precio inválido o plazo fuera de la lista → error claro (`isError`), sin consultar datos.
- AC-3: sin saldo ni salario registrados → mensaje que pide registrarlos en Cuenta.

## Supuestos
- Plazos: los de `PLANS` (BAC Costa Rica). Un plazo distinto (p. ej. 24) es error, no se redondea.
- No se compara contra los demás plazos: el asistente puede llamar la herramienta otra vez.
- El precio llega como texto decimal ("80000" o "80000.50"), igual que en el formulario.
