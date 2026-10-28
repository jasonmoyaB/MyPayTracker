-- PWA-01jm-T02: una fila por dispositivo suscrito a notificaciones push. Solo su dueño la ve.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Sin policy de update: el cliente guarda con "insert ... on conflict (endpoint) do nothing"
-- (upsert con ignoreDuplicates). Un endpoint ya guardado no cambia sus claves; si el navegador
-- rota la suscripción, el endpoint es otro y la vieja se borra sola al responder 404/410.
create policy "push_subscriptions: el dueño lee" on public.push_subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "push_subscriptions: el dueño crea" on public.push_subscriptions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "push_subscriptions: el dueño borra" on public.push_subscriptions
  for delete to authenticated
  using ((select auth.uid()) = user_id);
