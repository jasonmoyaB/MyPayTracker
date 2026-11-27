# ANA-02jm — Plan
## Domain (`src/domain/csv.ts`)
- `csvField(value)`: neutraliza fórmulas (`=`, `+`, `-`, `@` → prefijo `'`) y luego aplica comillas si hay `"`,
  `,`, `\n` o `\r` (duplicando comillas).
- `movementsCsv(rows)`: BOM + encabezados + una línea por movimiento con `\r\n`.
  Fecha con `costaRicaDateTime` (`date.ts`); monto con `centsToNumeric`; etiquetas de forma de pago como en la UI
  (reutilizar la función de etiqueta existente si está en domain; si está en UI, pasar la etiqueta ya resuelta).
- Categoría con `categoryOf` (CAT-01jm) solo en gastos.
## UI (`TransactionsPanel`)
- Botón "Exportar CSV" junto a los totales; `disabled` si `shown` está vacío.
- Crea `Blob([csv], { type: 'text/csv;charset=utf-8' })`, `URL.createObjectURL`, `<a download>` y revoca la URL.
## Pruebas
- `csv.test.ts`: AC-1..AC-4 y montos negativos imposibles (los montos son siempre positivos).
- `TransactionsPanel.test.tsx`: AC-5.
## Riesgos
- jsdom no implementa `URL.createObjectURL`: el test de UI lo simula.
- El monto con `-` no aplica: los montos son positivos y el tipo va en otra columna.
