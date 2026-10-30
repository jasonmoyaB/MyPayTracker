-- MOV-02jm-T01: SINPE es otro valor de payment_method y se liquida en su fecha como cash.
-- 0007 creó el check inline, así que Postgres lo nombró transactions_payment_method_check.
alter table public.transactions
  drop constraint transactions_payment_method_check,
  add constraint transactions_payment_method_check check (payment_method in ('cash', 'credit', 'sinpe'));

-- Con 'sinpe' ya no basta "cash o gasto": lo único prohibido en ingresos es la tarjeta.
alter table public.transactions
  drop constraint transactions_credit_solo_gasto,
  add constraint transactions_credit_solo_gasto check (payment_method <> 'credit' or direction = 'out');
