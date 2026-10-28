-- MAIL-01jm-T04: BAC notifica compras en CRC y USD; sin moneda el saldo mezclaría ambas.
alter table public.transactions
  add column currency text not null default 'CRC' check (currency in ('CRC', 'USD'));
