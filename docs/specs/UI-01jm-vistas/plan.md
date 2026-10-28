# UI-01jm — Plan

## Referencias
`docs/constitution.md` §4; `docs/design/*`; `src/domain/balance.ts`; tablas `settings` y `transactions`.

## Enfoque
1. El coordinador construye la base: capa `data/`, tema, shell con sesión y stubs con props fijas.
2. Luego 3 workers (Orca) trabajan en paralelo, cada uno dueño de archivos distintos.
3. El coordinador revisa y commitea cada entrega.

## Diseño
- **`data/`**:
  - `auth.ts`: `signIn`, `signOut`, `onSessionChange`, con un tipo `Session` propio para que ui no importe Supabase.
  - `settings.ts` y `transactions.ts`: convierten `numeric` ↔ centavos.
- **`domain/`** (TDD):
  - `money.ts`: `numeric` ↔ centavos sin float.
  - `amount.ts`: texto del usuario → centavos.
  - `summary.ts`: saldo en CRC, USD aparte.
  - `date.ts`: hora local de Costa Rica (−06:00).
- **`ui/`**:
  - `App`: decide entre login y dashboard y recarga los datos al guardar.
  - `format.ts`: `Intl` es-CR.
  - `theme.css`: tokens de la paleta.
- **Paneles con props fijas**:
  - `BalancePanel`: saldo, "¿Puedo comprar esto?" y salario.
  - `TransactionsPanel`: lista y formulario inline.
- Sin dependencias nuevas: los tests de UI usan `renderToStaticMarkup`.

## Estructura
| Archivo | Capa | Responsabilidad |
|---|---|---|
| `src/data/{auth,settings,transactions}.ts` | data | Supabase Auth y tablas |
| `src/domain/{money,amount,summary,date}.ts` | domain | cálculos puros con test |
| `src/ui/App.tsx`, `format.ts`, `theme.css` | ui | shell, formato, tokens |
| `src/ui/auth/LoginView.tsx` | ui | AC-1 (worker A) |
| `src/ui/balance/*` | ui | AC-2 a AC-4 (worker B) |
| `src/ui/transactions/*` | ui | AC-5, AC-6 (worker C) |

## Pruebas
- Tests de domain escritos antes de implementar.
- Test de marcado de `TransactionsPanel`.
- Test de arquitectura (ui no importa Supabase).
- typecheck y build.
