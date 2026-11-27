# ARQ-02jm — Plan
## Domain
- `src/domain/paging.ts`: `allPages(fetchPage, size = 1000)` llama `fetchPage(from, to)` con rangos
  0–999, 1000–1999… hasta que una página trae menos de `size` filas, y concatena.
- Pura y genérica; imports con extensión `.ts` porque la importan las Edge Functions (Deno).
## Data (app)
- `listTransactions` (`src/data/transactions.ts`) usa `allPages` con `.range(from, to)` y orden
  `occurred_at desc, id desc`. Mapeo de filas sin cambios.
## MCP (`supabase/functions/mcp/index.ts`)
- `ledger` usa `allPages` para las transacciones, con el mismo orden.
- La `query` por rango de `movimientos` ya tiene límite propio: no cambia.
## Sync (`supabase/functions/sync-bac-emails/`)
- `index.ts`: la lectura de `email_message_id` guardados usa `allPages`.
- `reminders.ts` (`dueCard`): la lectura de compras con tarjeta usa `allPages`.
## Pruebas
- `paging.test.ts`: AC-1, AC-2, AC-3 con un `fetchPage` simulado.
- Tests existentes de data/MCP/sync siguen pasando (ajustar mocks de `.range` si hace falta).
## Riesgos
- Mocks de Supabase que no conocen `.range`: se ajustan sin cambiar lo que prueban.
- Un `order` sin `id` puede repetir filas con la misma fecha entre páginas: por eso el desempate por `id`.
