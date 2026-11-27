-- MAIL-02jm-T01: correos del BAC que el parser no leyó. Así no se re-descargan cada pasada y avisan una sola vez.
-- Sin el texto del correo (datos sensibles): solo el id de Gmail y la fecha.
-- Si el parser aprende un formato nuevo, borrar la fila a mano hace que el cron lo vuelva a intentar.
create table public.unread_bank_emails (
  email_message_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  received_at timestamptz,
  -- false = no parece movimiento (SINPE rechazado, avisos sin monto): se guarda para no re-descargarlo, sin push.
  notify boolean not null,
  created_at timestamptz not null default now()
);

create index unread_bank_emails_user_idx on public.unread_bank_emails (user_id);

alter table public.unread_bank_emails enable row level security;

-- Solo lectura para el dueño; sin policies de escritura: escribe únicamente el cron con service_role.
create policy "unread_bank_emails: el dueño lee" on public.unread_bank_emails
  for select to authenticated
  using ((select auth.uid()) = user_id);
