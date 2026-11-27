-- CAT-01jm-T01: categoría que el dueño eligió a mano; nula = la asigna el dominio (historial, palabras u Otros).
-- Lista fija (un solo dueño): agregar una categoría es otra migración. La política "for all" de transactions cubre el update.
alter table public.transactions
  add column category text
  check (category in ('Súper', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Compras', 'Entretenimiento', 'Otros'));
