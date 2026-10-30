# MOV-02jm — Plan
## Módulos
1. **`supabase/migrations/0012_payment_method_sinpe.sql`** (nueva)
   - Reemplaza `transactions_payment_method_check` por `payment_method in ('cash', 'credit', 'sinpe')`.
   - Reemplaza `transactions_credit_solo_gasto` por `payment_method <> 'credit' or direction = 'out'`.
   - No toca default (`cash`), cuotas (0008/0009) ni RLS. Test de texto en `src/data/transactions.test.ts`, como 0007–0009.
2. **`src/domain/credit.ts`**: `PaymentMethod = 'cash' | 'credit' | 'sinpe'`. `splitCredit`, `dueOn` y
   `pendingPurchases` ya tratan todo lo que no es `credit` como pagado en su fecha: solo un test (AC-3).
3. **`src/ui/transactions/useTransactionForm.ts`**: en ingresos, si quedó `credit` se guarda `cash`; `sinpe` se
   respeta en ambos tipos. Cuotas = 1 si no es `credit` (ya existe).
4. **`src/ui/transactions/TransactionForm.tsx`** (`PaymentField`): select "Forma de pago" también en ingresos;
   opción SINPE siempre; Tarjeta solo en gastos; plazo solo con tarjeta (ya existe).
5. **`src/ui/transactions/TransactionsPanel.tsx`** (`originLabel`): prefijo `SINPE · ` antes de Manual/Correo BAC.
## Decisiones
- Sin columna ni tabla nueva: SINPE es un valor más de `payment_method`.
- No se toca `PLANS` ni "¿Puedo comprar esto?": ahí "contado" ya cubre efectivo, débito y SINPE.
- El MCP ya devuelve `payment_method` tal cual: mostrará `sinpe` sin cambios (se redepliega luego, junto con la web).
