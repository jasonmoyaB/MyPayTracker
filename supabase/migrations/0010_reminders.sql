-- REC-01jm-T01: pagos mensuales que el dueño quiere recordar. No son movimientos: no tocan saldo ni deuda.
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null check (currency in ('CRC', 'USD')),
  -- 29–31 caen en el último día de los meses cortos (lo resuelve el dominio).
  day smallint not null check (day between 1 and 31),
  -- Último día CR con aviso enviado; el cron lo reclama de forma atómica para no repetir.
  notified_on date,
  created_at timestamptz not null default now()
);

create index reminders_user_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

-- Sin policy de update: editar = borrar y crear; notified_on lo escribe la Edge Function con service_role.
create policy "reminders: el dueño lee" on public.reminders
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "reminders: el dueño crea" on public.reminders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "reminders: el dueño borra" on public.reminders
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Mismo marcador para el aviso del pago de la tarjeta (el 17 y el 20).
alter table public.settings
  add column card_notified_on date;
