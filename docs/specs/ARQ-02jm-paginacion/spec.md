# ARQ-02jm — Leer todos los movimientos, no solo 1000
## Objetivo
PostgREST devuelve máximo 1000 filas por consulta. Con un año de movimientos la app y el conector pierden historia:
cuotas de compras viejas, promedio de gasto y deuda de la tarjeta salen mal sin avisar.
## Requisitos
- La app (Resumen, Movimientos, Recordatorios) lee todos los movimientos del dueño, sin importar cuántos sean.
- El conector MCP (`puedo_comprar`, `resumen_mes`) lee todos los movimientos.
- La Edge Function `sync-bac-emails` lee todos los `email_message_id` ya guardados (si no, re-descarga y re-avisa).
- El orden de la app sigue igual (más recientes primero).
## Restricciones
- Sin migración, sin RPC nueva. RLS intacto: la app no filtra por `user_id` a mano.
- La lógica de paginar es pura y probada; las consultas solo la usan.
## Criterios de aceptación
- AC-1: con 2 500 movimientos se leen los 2 500 (3 páginas de 1000), sin repetir ni saltar ninguno.
- AC-2: con 0 movimientos se hace 1 consulta y devuelve lista vacía.
- AC-3: con exactamente 1000 se hace una segunda consulta que vuelve vacía y se termina.
## Supuestos
- Orden estable por `occurred_at` y `id` para que las páginas no se crucen; una inserción concurrente durante la
  lectura puede quedar para la próxima recarga (aceptable en una app de un solo usuario).
