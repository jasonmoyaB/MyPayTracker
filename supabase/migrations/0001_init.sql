-- ARQ-01jm-T05: esquema inicial (constitución §6). Cada fila pertenece a su user_id vía RLS.

create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  salary numeric(12, 2) not null default 0 check (salary >= 0),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  amount numeric(12, 2) not null check (amount > 0),
  direction text not null check (direction in ('in', 'out')),
  source text not null check (source in ('email_regex', 'email_ai', 'manual')),
  description text not null default '',
  occurred_at timestamptz not null default now(),
  email_message_id text unique,
  created_at timestamptz not null default now()
);

create index transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);

alter table public.settings enable row level security;
alter table public.transactions enable row level security;

create policy "settings: solo el dueño" on public.settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "transactions: solo el dueño" on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
