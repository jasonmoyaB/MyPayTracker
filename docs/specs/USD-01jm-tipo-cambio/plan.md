# USD-01jm — Plan
## Migración `00NN_usd_rate.sql` (siguiente libre)
- `alter table settings add column usd_rate numeric(10,2) check (usd_rate > 0);`
## Domain (`src/domain/money.ts`)
- `usdToCrcCents(usdCents, rateCents)`: `Math.round(usdCents * rateCents / 100)`. `rateCents` = tipo en céntimos
  (505,32 → 50 532), leído con `numericToCents` y escrito con `parseAmountToCents` (mismo formato que un monto).
## Data (`src/data/settings.ts`)
- `Settings.usdRateCents?: number | null`; `getSettings` lo lee; `saveUsdRateCents(cents)` lo guarda con `upsertSettings`.
## UI
- `AccountView`: otro `MoneySetting` "Tipo de cambio (₡ por $)".
- `BalanceCard` (o donde se muestran los USD del Resumen): línea "≈ ₡X al tipo ₡Y" si hay tipo y hay USD.
## Pruebas
- `money.test.ts`: AC-1, AC-2.
- `settings.test.ts`: lee y guarda `usd_rate`.
- Test de UI del Resumen: AC-4 y la línea con tipo.
- AC-3 lo cubre la validación existente de `MoneySetting` + el check de la BD.
## Riesgos
- `MoneySetting` puede mostrar el valor como moneda (₡): revisar que el texto del tipo se entienda.
- MCP: no cambia (el equivalente es solo de pantalla).
