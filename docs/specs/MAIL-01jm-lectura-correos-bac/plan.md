# MAIL-01jm — Plan

## Referencias
`docs/constitution.md` §1, §4, §5, §6; `src/domain/balance.ts`; `supabase/migrations/0001_init.sql`.
Correos reales revisados: compra CRC, compra USD, SINPE acreditado, SINPE rechazado.

## Enfoque
Todo lo que se puede romper vive en `domain/` como funciones puras, para probarlo con correos reales anonimizados.
La Edge Function solo hace I/O: pide un token a Google, lista los mensajes, llama al dominio y hace upsert.

## Diseño
- `domain/bankEmail.ts` (sin imports, para que Deno lo importe tal cual):
  - `htmlToText`: quita tags, decodifica entidades HTML comunes y numéricas, y colapsa espacios.
  - `parseBacPurchase`: lee Comercio, Fecha ("Oct 26, 2026, 18:59"), Tipo y Monto ("CRC 3,490.00"). Solo COMPRA → `out`.
  - `parseBacSinpe`: lee "se acreditó … monto de X Colones|Dólares, por concepto de Y. Día y hora dd/mm/yyyy hh:mm:ss a.m./p.m.". Rechazada → `null`.
  - `parseBankEmail(from, text)`: elige el parser por remitente, sin distinguir mayúsculas.
  - `gmailBodyText(payload)`: recorre las partes MIME, decodifica base64url en UTF-8 y prefiere `text/html`.
  - Los montos pasan a centavos enteros sin usar float: se quitan las comas y se unen entero y decimales.
- Migración `0002_currency.sql`: `currency text not null default 'CRC' check in ('CRC','USD')`.
- `supabase/functions/sync-bac-emails/index.ts`:
  - Pide un access token con el refresh token.
  - Busca en Gmail `from:(…BAC…) newer_than:7d`.
  - Por cada mensaje: obtiene el payload, lo parsea y hace upsert con `onConflict: email_message_id` e `ignoreDuplicates`.
  - Devuelve `{ inserted, skipped }`.
- Secrets: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `OWNER_USER_ID`. `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase.

## Estructura objetivo
| Archivo | Capa | Responsabilidad |
|---|---|---|
| `src/domain/bankEmail.ts` | domain | parsers y conversión del cuerpo |
| `src/domain/bankEmail.test.ts` | domain | AC-1 a AC-4 |
| `src/domain/__fixtures__/*.txt` | domain | correos reales anonimizados |
| `supabase/migrations/0002_currency.sql` | BD | AC-6 |
| `supabase/functions/sync-bac-emails/index.ts` | función | AC-5, AC-7 |

## Pruebas
- Fixtures: compra CRC, compra USD, SINPE acreditado, SINPE rechazado, y una variante HTML con entidades.
- Casos borde: tipo distinto de COMPRA, remitente desconocido, mayúsculas en el remitente, 12 a.m./p.m.
- La función no lleva test unitario: es solo I/O. Se verifica con `deno check` si Deno está disponible.
