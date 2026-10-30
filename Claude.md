# MyPayTracker

App personal que responde "¿puedo comprar esto?": salario + ingresos − gastos ≥ precio. Los movimientos llegan de los correos del BAC en Gmail (Edge Function + cron) o se registran a mano (tarjeta de crédito). Principios en `docs/constitution.md`; diseño en `docs/design/`.

## Comandos

- `pnpm dev`: servidor Vite.
- `pnpm test`: Vitest. Tiene que pasar antes de cada commit.
- `pnpm typecheck`: `tsc --noEmit`. Tiene que pasar antes de cada commit.
- `pnpm build`: typecheck + build.

Usa pnpm (no npm ni yarn) y no agregues dependencias si unas líneas bastan.

## Capas (`ui → data → domain`)

- `src/domain/`: lógica pura (saldo, montos, fechas, parser de correos BAC). Sin React ni Supabase. Todo con test previo.
- `src/data/`: queries a Supabase. Usa el cliente único de `src/data/supabase.ts`. Sin React.
- `src/ui/`: componentes React. Sin lógica de negocio y sin importar Supabase.
- `src/architecture.test.ts` falla si algún import rompe estas reglas: no lo desactives.
- La Edge Function `supabase/functions/sync-bac-emails/` solo hace I/O y reutiliza `src/domain/bankEmail.ts`.

## Invariantes

- **Dinero en centavos enteros** (`number`) en todo el código. Para convertir desde o hacia `numeric(12,2)` usa `numericToCents` / `centsToNumeric` (`src/domain/money.ts`) y, para lo que escribe el usuario, `parseAmountToCents` (`src/domain/amount.ts`). Nunca uses floats para montos.
- **Moneda:** cada transacción es `CRC` o `USD`. Nunca sumes montos de monedas distintas.
- **RLS** en todas las tablas: cada fila es del `user_id` dueño. Las queries del frontend confían en RLS y no filtran a mano.
- **Esquema solo por migraciones** nuevas y numeradas en `supabase/migrations/` (`000N_nombre.sql`). No edites migraciones ya aplicadas.
- **Idempotencia:** `transactions.email_message_id` es único; la sincronización hace upsert y nunca duplica.
- **Secretos:** en el frontend y en `.env` solo va la publishable key. La `service_role`, las credenciales de Gmail y el secreto del cron viven en Supabase secrets o Vault, nunca en git.
- **Parsers:** se prueban con correos reales anonimizados de `src/domain/__fixtures__/`. La IA se simula en los tests.
- Nunca hagas `db push`, push a git ni cambios en el Supabase remoto sin pedírselo explícitamente al dev.

## Convenciones

- Código, comentarios, UI y commits en español.
- Commits: `tipo(ámbito): TICKET-Tnn descripción`, p. ej. `feat(domain): MAIL-01jm-T01 parser de compras BAC`. Un commit por tarea.
- Los comentarios explican el porqué, no el qué. Cuando aplique, cita la tarea (`// MAIL-01jm-T05: ...`).

```markdown
## Flujo de trabajo obligatorio

No se genera código, tickets ni tareas sin una spec. Las specs viven en `docs/specs/TICKET-nombre/`, donde `TICKET` es el número del ticket (p. ej. `docs/specs/RIDY-42-login/`). Así dos devs en paralelo nunca chocan de número. Las tareas se identifican como `TICKET-Tnn` (p. ej. `RIDY-42-T01`).

1. **Leer** el ticket o la tarea por hacer.
2. **Crear la spec**: `docs/specs/TICKET-nombre/spec.md`.
3. **Crear el plan**: leer `spec.md` y escribir `plan.md` en la misma carpeta.
4. **Crear las tareas**: leer `spec.md` y `plan.md` y escribir `task.md` con las tareas por hacer como checkboxes (`- [ ]`). Cada tarea se marca `- [x]` al completarse.

**Longitud** (al grano, sin relleno):

| Archivo | Líneas | Enfoque |
|---|---|---|
| `spec.md` | 10–30 | El **qué**: objetivo de negocio, requisitos de usuario, restricciones críticas, criterios de aceptación. Sin detalles técnicos. |
| `plan.md` | 20–50 | El **cómo**: arquitectura y decisiones de diseño en módulos independientes. Sin código. |
| `task.md` | Máx. 100 | La **ejecución**: lista secuencial de tareas atómicas y testeables. Cada tarea 1–2 líneas. |

- **< 10 líneas** → ambiguo, la IA adivina. Añadir restricciones.
- **> 50 líneas** (spec o plan) o **> 100** (task) → sobre-especificado. Partir la feature en sub-features con su propia carpeta.

Ningún paso empieza sin que el anterior exista. Si falta la spec, se crea antes de cualquier otra cosa.

## Agentes (`planner` → `coder` → `reviwer`)

- **Tareas pequeñas:** no hace falta usar los agentes. Se sigue el flujo de spec, pero se trabaja directamente.
- **Tareas grandes y complejas:** se recomienda la secuencia `planner` → `coder` → `reviwer`. Criterios: toca varias capas o módulos, cambia reglas de negocio, o sale en 4+ tareas (detalle en `.claude/agents/planner.md` → *Cuándo se usa*).
- **Quién decide:** el dev indica en su prompt si quiere usar los agentes o no. Si no lo dice, no se lanzan.
```