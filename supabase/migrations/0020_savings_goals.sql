-- META-01jm-T01: metas de ahorro. Cada meta en su moneda; nunca se suman CRC y USD entre metas.
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  target numeric(12, 2) not null check (target > 0),
  currency text not null check (currency in ('CRC', 'USD')),
  -- La meta es por mes: se guarda el día 1 de ese mes.
  deadline date not null check (extract(day from deadline) = 1),
  saved numeric(12, 2) not null default 0 check (saved >= 0),
  created_at timestamptz not null default now()
);

create index savings_goals_user_idx on public.savings_goals (user_id);

alter table public.savings_goals enable row level security;

create policy "savings_goals: el dueño lee" on public.savings_goals
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "savings_goals: el dueño crea" on public.savings_goals
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "savings_goals: el dueño actualiza lo ahorrado" on public.savings_goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "savings_goals: el dueño borra" on public.savings_goals
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Como 0011/0017: el dueño no elige id, user_id ni created_at, y después de crear solo cambia lo ahorrado.
revoke insert, update on public.savings_goals from authenticated;
grant insert (name, target, currency, deadline, saved), update (saved) on public.savings_goals to authenticated;
