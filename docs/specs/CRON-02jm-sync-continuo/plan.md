# CRON-02jm — Plan

## Base
spec.md de esta carpeta; continúa CRON-01jm y MAIL-01jm.

## Módulos

### 1. Edge Function `sync-bac-emails`
- Rango de Gmail: solo `after:2026/10/01`, sin `before:`.
- Antes de descargar cada correo, leer de `transactions` los `email_message_id` ya guardados
  y saltarlos. Listar ids en Gmail es barato (100 por página); descargar cada correo es lo caro.
- Correos que no generan movimiento (p. ej. SINPE rechazado) no se guardan y se vuelven a
  descargar cada corrida: pocos por mes, se acepta y se marca con comentario `ponytail:`.
- Respuesta suma `skipped` (ya guardados) para poder verificar AC-2.

### 2. Horario del cron
- Migración `0005`: cambiar el job `sync-bac-emails-hourly` a `*/5 * * * *` con `cron.alter_job`.
- Se mantiene el nombre del job (renombrar exige borrar y recrear; no aporta).

### 3. Recarga en la UI
- `Dashboard` (`src/ui/App.tsx`) ya tiene `load()`; se llama:
  - cada 60 s si `document.visibilityState === 'visible'`;
  - en el evento `visibilitychange` al volver a visible.
- Sin Realtime: evita migración de publicación y conexión abierta; la latencia la marca el cron.
- La recarga en segundo plano no muestra "Cargando…" (solo la primera vez, como hoy).

### 4. Despliegue
- `functions deploy`, `db push` (con dry-run antes), `vercel deploy --prod`.

## Riesgos
- Cuota Gmail: ~1 list + pocos get cada 5 min, muy por debajo del límite.
- Invocaciones Edge: ~8 640/mes, dentro del plan gratuito.
