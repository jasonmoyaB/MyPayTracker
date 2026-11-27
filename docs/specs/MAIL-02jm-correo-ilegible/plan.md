# MAIL-02jm — Plan
## Migración `00NN_unread_bank_emails.sql`
- Tabla con `user_id uuid not null references auth.users on delete cascade`, `email_message_id text primary key`,
  `received_at timestamptz`, `notify boolean not null`, `created_at timestamptz default now()`.
- RLS habilitado; policy select del dueño; sin policies de escritura (solo service_role).
## Domain (`src/domain/bankEmail.ts`)
- `looksLikeMovement(text)`: hay un monto (`CRC|USD|₡|$` + número) y no es un SINPE rechazado (reutiliza las
  regex existentes). Test con fixtures de `__fixtures__/` (SINPE rechazado real) y uno nuevo anonimizado.
## Sync (`supabase/functions/sync-bac-emails/index.ts`)
- `known` = ids de `transactions` ∪ ids de `unread_bank_emails` (paginado, ARQ-02jm): no se re-descargan.
- Si `parseBankEmail` da null: guarda `{ id, received_at, notify: looksLikeMovement(texto) }`.
- Upsert `ignoreDuplicates` + select → solo las nuevas con `notify` mandan push (`pushToOwner`); nunca rompe el sync.
- Esto reemplaza el comentario `ponytail:` de re-descarga.
## Domain del aviso
- `unreadNotification(receivedAt)` en `notification.ts` con fecha CR.
## Pruebas
- `bankEmail.test.ts`: AC-1 (fixture nuevo), AC-3, AC-4.
- Test del sync o de un helper extraído: AC-2 (id conocido no se descarga).
## Riesgos
- Un correo que el parser aprenda a leer después ya quedó en `unread_bank_emails` y no se reintenta: se borra
  la fila a mano para reintentar (documentado en el comentario).
