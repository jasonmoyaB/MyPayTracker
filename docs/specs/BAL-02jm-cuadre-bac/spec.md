# BAL-02jm — Cuadre con el saldo real del BAC
## Objetivo
Si la app dice un saldo y el BAC otro, no sé cuánto ni por qué. Quiero ver la diferencia para encontrar lo que
falta (un SINPE sin registrar, un correo que no se leyó).
## Requisitos
- En Cuenta veo "La app calcula hoy: ₡X" junto al campo "Saldo actual en BAC".
- Al guardar un saldo BAC nuevo, el aviso dice la diferencia con lo que calculaba la app justo antes:
  "La app tenía ₡3 500 de más" / "de menos" / "Cuadra con la app".
- Después de guardar, el saldo BAC pasa a ser el nuevo punto de partida (como hoy, BAL-01jm).
- La cifra de la app es la misma del Resumen (saldo disponible, con las cuotas ya pagadas y sin las pendientes).
## Restricciones
- Sin migración. Reutiliza `splitCredit`, `paidUntil` y `summaryFor`. Solo CRC. Centavos enteros.
- La diferencia se calcula en domain; la UI solo la muestra.
## Criterios de aceptación
- AC-1: app ₡58 930, BAC ₡55 430 → "La app tenía ₡3 500 de más".
- AC-2: app ₡50 000, BAC ₡52 000 → "La app tenía ₡2 000 de menos".
- AC-3: iguales → "Cuadra con la app".
- AC-4: sin saldo ni salario guardados → no se muestra "La app calcula hoy" ni diferencia.
## Supuestos
- Los correos BAC no traen saldo (fixtures sin saldo): el cuadre es manual, con el saldo que el dev copia del BAC.
- No se guarda historial de cuadres (YAGNI); se agrega si el dev lo pide.
