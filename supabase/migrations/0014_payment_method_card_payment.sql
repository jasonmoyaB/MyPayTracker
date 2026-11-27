-- TC-11jm-T01: "Pago de tarjeta" marcado a mano; no es gasto del mes (ya se restan las cuotas que paga).
-- El check viene de 0012 (mismo nombre que Postgres le dio al inline de 0007).
alter table public.transactions
  drop constraint transactions_payment_method_check,
  add constraint transactions_payment_method_check check (payment_method in ('cash', 'credit', 'sinpe', 'card_payment'));

-- Pagar la tarjeta es un gasto de un solo pago: ni ingreso ni a plazo.
alter table public.transactions
  add constraint transactions_card_payment_gasto_un_pago check (payment_method <> 'card_payment' or (direction = 'out' and installments = 1));
