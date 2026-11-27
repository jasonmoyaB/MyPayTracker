# CAT-01jm — Plan
## Migración `00NN_transaction_category.sql`
- `alter table transactions add column category text check (category in (...lista...));`
## Domain (`src/domain/category.ts`, imports `.ts` para Deno)
- `CATEGORIES` (const), tipo `Category`.
- `KEYWORDS`: palabras por categoría (súper: auto mercado, walmart, mas x menos, pali, pricesmart, perimercados;
  transporte: uber, didi, gasolinera, servicentro, peaje; comida: restaurante, soda, pizza, mcdonalds, kfc,
  starbucks; servicios: ice, kolbi, cnfl, aya, tigo, claro, liberty, netflix, spotify; salud: farmacia, fischel,
  clinica, hospital; entretenimiento: cine, steam, playstation).
- `categorize(movements)`: devuelve un `Map<movimiento, Category>` o una función `categoryOf(m)` que aplica el orden
  del spec usando las asignaciones manuales del mismo listado. Solo gastos.
## Data (`src/data/transactions.ts`)
- `Transaction.category: Category | null`; select y mapeo de `category`.
- `setTransactionCategory(id, category)` con update (RLS lo limita al dueño).
## UI (`TransactionsPanel`)
- En la fila de cada gasto, `<select>` accesible con la categoría efectiva; al cambiar llama
  `setTransactionCategory` y recarga (mismo patrón que guardar un movimiento).
## Pruebas
- `category.test.ts`: AC-1..AC-4 y normalización.
- `transactions.test.ts`: mapeo y update de `category`.
- `TransactionsPanel.test.tsx`: AC-5 (llama a guardar con la categoría).
## Riesgos
- Fila de Movimientos más cargada en móvil: el select va compacto bajo la descripción.
- PRES-01jm y ANA-01jm dependen de `categoryOf`: debe ser estable y sin I/O.
