-- TC-02jm-T01: tasa cero de BAC Costa Rica (3, 6, 10 o 12 meses); 1 = un solo pago. Lo existente y el cron quedan en 1.
alter table public.transactions
  add column installments smallint not null default 1 check (installments in (1, 3, 6, 10, 12));

-- Las cuotas solo existen en la tarjeta de crédito.
alter table public.transactions
  add constraint transactions_cuotas_solo_tarjeta check (installments = 1 or payment_method = 'credit');
