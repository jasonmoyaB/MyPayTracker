# TC-07jm — Plan
## Módulos
1. **`src/domain/credit.ts`**: `pendingPurchases` pasa el `id` de cada compra (para poder borrarla).
2. **`src/ui/dashboard/DebtForm.tsx`**: `checkDebt` acepta `date` (`YYYY-MM-DD`). Con fecha devuelve
   `occurredAt` = esa fecha a las 12:00 CR y valida que no sea futura ni ya pagada (`installmentDues`). El submit
   guarda `amountCents = precio`, `installments = plazo` y ese `occurredAt`; sin fecha, igual que hoy (`ongoingPurchase`).
   `<input type="date" max={hoy}>` nativo; los campos "queda" y "por mes" se ocultan si hay fecha.
3. **`src/data/transactions.ts`**: `deleteTransaction(id)` = `delete().eq('id', id)`; RLS limita al dueño.
4. **`src/ui/dashboard/CreditCard.tsx`**: en el `<dialog>` del producto, botón "Eliminar deuda" →
   `confirm()` nativo → `saveWithToast(deleteTransaction)` → `onSaved()` (recarga el dashboard).
## Decisiones
- `confirm()` del navegador en vez de un modal propio: ya estamos dentro de un `<dialog>` y basta.
- Sin "deshacer": con la confirmación alcanza para un error ocasional.
