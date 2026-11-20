-- TC-10jm-T01: el 20 (00:00 CR) hasta el que el dueño confirmó el pago de la tarjeta. null = nunca marcó:
-- el dominio cae al criterio por fecha (AC-5). La política "for all" de settings ya cubre su update.
alter table public.settings
  add column card_paid_through timestamptz;

-- Las filas que ya existen venían dando por pagado cada 20 vencido: se marcan hasta el último 20
-- estrictamente anterior a hoy (fecha CR) para no resucitar deuda vieja. El 20 de hoy queda sin pagar.
-- Hoy − 20 días cae en el mes de ese 20 (20 nov → 31 oct → 20 oct; 25 nov → 5 nov → 20 nov).
update public.settings
  set card_paid_through = (date_trunc('month', ((now() at time zone 'America/Costa_Rica')::date - 20)::timestamp)
    + interval '19 days') at time zone 'America/Costa_Rica';
