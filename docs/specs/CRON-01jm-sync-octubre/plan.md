# CRON-01jm — Plan

## Referencias
`docs/constitution.md` §6; `supabase/functions/sync-bac-emails/index.ts`; `MAIL-01jm`.

## Enfoque
Programar la función existente desde la propia base de datos, sin infraestructura nueva.
La autorización se resuelve con un secreto generado dentro de la BD, así no viaja por git ni por el chat.

## Diseño
- **Rango**: la búsqueda de Gmail usa `after:2026/10/01 before:2026/11/01` y recorre todas las páginas (`nextPageToken`).
- **Programación**: `pg_cron` ejecuta cada hora (`0 * * * *`) una petición `pg_net` a la función.
- **Secreto**: la migración crea un valor aleatorio en Vault (`sync_bac_cron_secret`).
  - El cron lo manda en el header `x-cron-secret`.
  - La función lo valida con la RPC `is_valid_cron_secret`, ejecutable solo por `service_role`.
- **JWT**: la validación del gateway sigue activa.
  - El cron envía además la publishable key, que es pública por diseño.
  - Apagar `verify_jwt` se descartó porque debilita la seguridad.
- **Idempotencia**: se reutiliza el upsert por `email_message_id` de `MAIL-01jm`.

## Estructura
| Archivo | Capa | Responsabilidad |
|---|---|---|
| `supabase/migrations/0003_cron.sql` | BD | extensiones, secreto, RPC, job |
| `supabase/functions/sync-bac-emails/index.ts` | función | rango, paginación, validar secreto |

## Pruebas
- La función es solo I/O, así que no lleva test unitario: se verifica con `deno check`.
- Prueba manual: curl sin secreto y con secreto falso → 401.
- Prueba real: llamada con el secreto desde el SQL Editor → `scanned = parsed`, sin duplicados.
