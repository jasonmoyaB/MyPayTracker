# TC-12jm — Plan
## Domain
- Sin función nueva si basta `parseAmountToCents` + suma de enteros; la validación (≥ 0) va donde ya se valida
  el monto del formulario (`useTransactionForm.ts` o el domain de montos).
- Se actualiza el comentario `ponytail:` de `installmentDues` (`credit.ts`): la comisión ya entra en el monto.
## UI
- `TransactionForm` / `useTransactionForm`: campo "Comisión (opcional)" visible solo con tarjeta y plazo > 1.
- Al guardar: `amountCents = precio + comisión`. Error accesible (`aria-describedby`) si la comisión es inválida.
- La edición de deuda (TC-08jm) no cambia.
## Pruebas
- Test del hook o del formulario: AC-1 (monto enviado 12 600 000 centavos), AC-2, AC-3, AC-4.
## Riesgos
- La edición posterior muestra el total, no precio + comisión: documentado en Supuestos.
- Cambiar de tarjeta a efectivo con comisión escrita: la comisión se ignora (campo oculto = no cuenta).
