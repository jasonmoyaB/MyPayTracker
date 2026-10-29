-- TC-01jm-T01: las compras con tarjeta no bajan el saldo hasta su día de pago; el cron y lo existente quedan en cash.
alter table public.transactions
  add column payment_method text not null default 'cash' check (payment_method in ('cash', 'credit'));

-- Un ingreso "con tarjeta" no tiene sentido: la tarjeta solo difiere gastos.
alter table public.transactions
  add constraint transactions_credit_solo_gasto check (payment_method = 'cash' or direction = 'out');
