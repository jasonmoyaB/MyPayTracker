-- TC-04jm-T01: una deuda que ya venía pagando se carga con las cuotas que le quedan (1–12),
-- no solo con los plazos de BAC (1, 3, 6, 10, 12). transactions_cuotas_solo_tarjeta no cambia.
alter table public.transactions
  drop constraint transactions_installments_check,
  add constraint transactions_installments_check check (installments between 1 and 12);
