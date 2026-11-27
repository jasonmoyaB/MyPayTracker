-- PRES-01jm-T01: tope mensual en colones por categoría (CAT-01jm). Solo CRC.
create table public.budgets (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('Súper', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Compras', 'Entretenimiento', 'Otros')),
  amount numeric(12, 2) not null check (amount > 0),
  -- Mes CR ('2026-11') con aviso del 80 % / 100 % ya enviado; el cron los reclama de forma atómica para no repetir.
  warned_month text,
  exceeded_month text,
  primary key (user_id, category)
);

alter table public.budgets enable row level security;

create policy "budgets: el dueño lee" on public.budgets
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "budgets: el dueño crea" on public.budgets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "budgets: el dueño cambia el tope" on public.budgets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "budgets: el dueño borra" on public.budgets
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Como 0011: los marcadores quedan fuera del alcance del dueño (los escribe la Edge Function con service_role).
-- category entra en update porque el upsert de PostgREST reescribe todas las columnas que manda.
revoke insert, update on public.budgets from authenticated;
grant insert (category, amount), update (category, amount) on public.budgets to authenticated;
