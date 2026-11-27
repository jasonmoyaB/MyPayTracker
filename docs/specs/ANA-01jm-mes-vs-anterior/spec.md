# ANA-01jm — Este mes contra el anterior
## Objetivo
Quiero saber si este mes estoy gastando más o menos que el pasado y en qué categoría.
## Requisitos
- En el Resumen, una tarjeta "Contra el mes pasado" muestra por categoría (CAT-01jm): este mes, el mes pasado al
  mismo día y la diferencia con signo ("+₡12 000" / "−₡5 000").
- Se compara al mismo día del mes (hoy 10 nov contra 1–10 oct) para no comparar medio mes contra un mes entero.
- Mismos gastos que "Este mes" (GAS-01jm): cuotas en su mes, sin pagos de tarjeta. Solo CRC.
- Ordenado por la diferencia más grande primero; categorías en cero en ambos meses no se muestran.
## Restricciones
- Cálculo puro en domain. Reutiliza `monthlyCharges`, `categoryOf` y la zona CR (`CR_OFFSET_MS`).
## Criterios de aceptación
- AC-1: hoy 10 nov; Súper ₡40 000 (1–10 nov) y ₡30 000 (1–10 oct) → Súper +₡10 000.
- AC-2: un gasto del 15 oct no cuenta en la comparación del 10 nov.
- AC-3: hoy 31 mar, el mes pasado (feb) se toma completo (no existe 31 feb).
- AC-4: sin gastos en ninguno de los dos → la tarjeta dice "Sin gastos para comparar".
## Supuestos
- Mes pasado "al mismo día" = hasta el mismo día o el último del mes si es más corto.
- Sin gráfico: lista con montos (accesible y sin dependencias).
- `categoryOf` no existe como export: se usa `categorize` (CAT-01jm), como `budgetStatus`.
- "Este mes" va hasta ahora: una cuota que vence más adelante en el mes no entra hasta su día.
