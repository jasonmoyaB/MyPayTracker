-- CRON-01jm: sincroniza correos BAC cada hora y cierra la función a todo lo que no sea el cron.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Secreto aleatorio creado dentro de la BD: nunca pasa por git ni por el chat.
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'sync_bac_cron_secret');

-- La Edge Function valida el header con esto (service role); anon/authenticated no pueden llamarla.
create function public.is_valid_cron_secret(candidate text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'sync_bac_cron_secret' and decrypted_secret = candidate
  );
$$;

revoke execute on function public.is_valid_cron_secret(text) from public, anon, authenticated;
grant execute on function public.is_valid_cron_secret(text) to service_role;

select cron.schedule(
  'sync-bac-emails-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://jgwbihaekplkirlfjjol.supabase.co/functions/v1/sync-bac-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_bac_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
