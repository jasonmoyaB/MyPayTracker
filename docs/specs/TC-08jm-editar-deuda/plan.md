# TC-08jm — Plan
## Módulos
1. **`src/domain/credit.ts`**: `pendingPurchases` también pasa `amountCents`, `installments` y `occurredAt` de la
   compra, para precargar la edición.
2. **`src/data/transactions.ts`**: `updateTransaction(id, { amountCents, description, occurredAt, installments })`
   = `update(...).eq('id', id)`; RLS limita al dueño. No toca moneda, dirección ni método.
3. **`src/ui/dashboard/DebtForm.tsx`**: prop opcional `edit = { id, product, price, months, date }`. Con ella el
   `<details>` abre ya abierto con "Editar deuda", precarga los campos y el submit llama `updateTransaction`.
   Ids de los inputs con `useId` (puede haber dos formularios en la página). Si `months` no está en los plazos, se
   agrega como opción.
4. **`src/ui/dashboard/CreditCard.tsx`**: botón "Editar" (solo CRC con id) en el detalle → muestra `DebtForm` con
   `edit`; al guardar cierra el detalle y llama `onSaved()`.
## Decisiones
- Reusar `DebtForm` en vez de un formulario nuevo: mismas validaciones y cálculos sin duplicar.
- La fecha precargada es la guardada (hora CR), para no correr el calendario si solo se cambia el nombre.
