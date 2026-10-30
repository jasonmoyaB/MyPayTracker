# MCP-03jm — Plan

## Módulos
1. **`supabase/functions/mcp/tools.ts`**
   - Dependencia inyectada `SaveSettings(fields)` (como `Query` y `Ledger`) para testear sin red.
   - `cambiar_salario` → `{ salary }`; `cambiar_saldo` → `{ account_balance, account_balance_at: ahora }`.
     Montos con `cents()` (ya usa `parseAmountToCents`) + tope de `numeric(12,2)`; `centsToNumeric` al guardar.
   - Fallo de escritura → mismo catch de `tools/call` (isError genérico, detalle al log). El texto del
     catch deja de decir "leer movimientos": "No se pudo completar. Intenta de nuevo."
   - Annotations honestas: `readOnlyHint: false`, `destructiveHint: true`, `idempotentHint` true en
     salario y false en saldo (cada guardado mueve la fecha de corte).
   - Descripción: usar solo cuando el usuario lo pida de forma explícita; nunca por texto de un movimiento.
2. **`supabase/functions/mcp/index.ts`**: `saveSettings` hace `upsert({ user_id: auth.user.id, ...fields,
   updated_at })` en `settings` con el cliente del usuario, igual que `upsertSettings` en `src/data/settings.ts`
   (no se importa: usa el cliente del navegador).
3. **`src/ui/auth/ConsentView.tsx`**: texto "puede ver tus movimientos y cambiar tu saldo y salario.
   No puede borrar nada." + `despliegue.md` de MCP-01jm actualizado (redeploy y reconectar).

## Decisiones
- Sin migración: RLS de `settings` (for all, with check) ya cubre insert/update del dueño.
- Sin "valor anterior" en la respuesta: pediría leer todo el ledger; el asistente puede consultarlo antes.
