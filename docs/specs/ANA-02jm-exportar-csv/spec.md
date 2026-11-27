# ANA-02jm — Exportar movimientos a CSV
## Objetivo
Quiero sacar mis movimientos a Excel para revisarlos o para la declaración.
## Requisitos
- En Movimientos, un botón "Exportar CSV" descarga los movimientos que se ven con el filtro actual.
- Columnas: fecha (CR, AAAA-MM-DD HH:MM), descripción, tipo (Ingreso/Gasto), moneda, monto (punto decimal, sin
  separador de miles), forma de pago, cuotas, categoría.
- Cada movimiento sale tal cual se registró (la compra a plazo con su monto total, no las cuotas).
- El archivo se llama `movimientos-AAAA-MM-DD.csv` (fecha de hoy CR) y abre bien en Excel con tildes.
## Restricciones
- Sin dependencias: CSV a mano en domain, descarga con `Blob` en la UI. Sin servidor ni tabla nueva.
- Seguridad: escapar comillas, comas y saltos de línea; un campo que empieza con `=`, `+`, `-` o `@` se antepone
  con `'` (inyección de fórmulas en Excel).
- Montos desde centavos enteros (`centsToNumeric`), nunca floats.
## Criterios de aceptación
- AC-1: descripción `Soda "La Esquina", Escazú` → `"Soda ""La Esquina"", Escazú"`.
- AC-2: descripción `=HYPERLINK(...)` → `'=HYPERLINK(...)`.
- AC-3: ₡1 616 674 céntimos → `16166.74`.
- AC-4: el archivo empieza con BOM UTF-8 y encabezados.
- AC-5: con el filtro vacío el botón está deshabilitado.
## Supuestos
- Separador coma; Excel en español puede pedir importar; el BOM asegura las tildes.
- La etiqueta de forma de pago vive en la UI (`originLabel` compone texto): `csv.ts` usa el mismo texto que las
  opciones del formulario. La categoría la resuelve el `categoryOf` que ya arma Movimientos con todo el historial.
- Además de `= + - @` se neutralizan tab y retorno de carro al inicio (lista de OWASP); más conservador.
