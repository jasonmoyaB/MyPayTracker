# ALR-01jm — Plan
## Domain (`src/domain/unusual.ts`, imports `.ts`)
- `normalizeMerchant(description)` (sin tildes/mayúsculas/espacios dobles); si CAT-01jm ya tiene uno, se reutiliza.
- `unusualExpense(movement, history)` → `{ typicalCents } | null` con mediana de los gastos previos del mismo
  comercio y moneda; regla de AC-1..AC-4.
- `unusualNotification(movement, typicalCents)` → payload con título "Gasto inusual" (mismo formato que
  `movementNotification` de `notification.ts`).
## Sync (`supabase/functions/sync-bac-emails/`)
- `index.ts`: si hay filas nuevas de gasto, lee el historial de gastos del dueño (paginado, ARQ-02jm) antes de
  notificar.
- `push.ts` / `notifyNewMovements`: por cada fila nueva usa el payload de gasto raro si aplica; si no, el normal.
  El historial excluye las filas recién insertadas (por `email_message_id` o fecha).
## Pruebas
- `unusual.test.ts`: AC-1..AC-4 y mediana con cantidad par.
- `push.test.ts`: una fila rara manda el payload "Gasto inusual" y no el normal.
## Riesgos
- Leer todo el historial en cada pasada con filas nuevas: solo cuando hay filas nuevas, aceptable.
- Si el historial falla, se manda el push normal (nunca rompe el sync).
