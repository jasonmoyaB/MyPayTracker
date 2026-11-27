-- FIJ-01jm-T01: el recordatorio aparta su monto de "Puedes gastar" hasta marcarlo pagado.
alter table public.reminders
  add column reserve boolean not null default false;

-- La policy de update del dueño ya existe (0011); los privilegios de columna se suman a paid_on.
-- Monto, día y notified_on (lo escribe la Edge Function) siguen fuera de su alcance.
grant update (reserve) on public.reminders to authenticated;
