# CRON-01jm — Sincronización programada (octubre)

## Problema
`sync-bac-emails` solo corre si alguien la llama, y cualquiera con la publishable key puede llamarla.

## Objetivo
Correrla sola cada hora, leer únicamente correos de octubre 2026 y aceptar llamadas solo del cron.

## Criterios de aceptación
- AC-1: la query de Gmail usa `after:2026/10/01 before:2026/11/01` y pagina con `nextPageToken`.
- AC-2: `pg_cron` llama la función cada hora (`0 * * * *`) vía `pg_net`.
- AC-3: sin header `x-cron-secret` válido → HTTP 401 y no se lee Gmail.
- AC-4: el secreto se genera en Vault dentro de la BD; no está en git, ni en secrets de la función, ni en el chat.

## Fuera de alcance
Rango configurable desde la UI, aviso cuando caduque el refresh token.

## Supuestos
- "Únicamente octubre" es literal: desde noviembre el cron no trae correos nuevos hasta cambiar `DATE_RANGE`.
- La función se despliega con `--no-verify-jwt`: la valida el secreto, no el JWT del gateway.
