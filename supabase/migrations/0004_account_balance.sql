-- BAL-01jm: saldo real de la cuenta BAC en un momento dado; el saldo disponible parte de ahí.
alter table public.settings
  add column account_balance numeric(12, 2),
  add column account_balance_at timestamptz,
  add constraint settings_account_balance_pair
    check ((account_balance is null) = (account_balance_at is null));
