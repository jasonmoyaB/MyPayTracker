-- USD-01jm-T01: colones por dólar que el dueño escribe a mano; solo informativo (nunca se suma a CRC).
-- Nulo = sin tipo: la app no muestra equivalentes. La política "for all" de settings ya cubre su update.
alter table public.settings
  add column usd_rate numeric(10, 2) check (usd_rate > 0);
