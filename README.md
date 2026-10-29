# MyPayTracker

Responde una sola pregunta: **¿puedo comprar esto?**

Ingresas tu salario. La app lee los correos del BAC en Gmail. Las compras con tarjeta de crédito se registran a mano. El saldo disponible es:

```
salario + ingresos − gastos ≥ precio
```

## Stack

- React 19 + Vite + TypeScript
- Supabase: Postgres, Auth, Edge Function y `pg_cron`
- Vitest

## Puesta en marcha

```bash
pnpm install
cp .env.example .env   # VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
pnpm dev
```

En `.env` solo va la **publishable key**. La `service_role` nunca va en el frontend.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Typecheck + build de producción |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (tiene que pasar antes de cada commit) |

## Estructura

```
src/
  domain/   lógica pura: dinero, montos, fechas, saldo, parser de correos BAC
  data/     queries a Supabase (auth, settings, transactions)
  ui/       componentes React, sin lógica de negocio ni SQL
supabase/
  migrations/                  esquema, RLS y cron
  functions/sync-bac-emails/   lee Gmail y guarda transacciones
docs/
  constitution.md   principios del proyecto
  design/           UI/UX y paleta
  specs/            una carpeta por ticket: spec → plan → task
```

`src/architecture.test.ts` verifica que se respeten las capas (`ui → data → domain`): `domain` no importa React ni Supabase, y `ui` no importa Supabase.

## Datos

- `settings(user_id, salary)`
- `transactions(user_id, amount, direction in|out, source email_regex|email_ai|manual, description, occurred_at, email_message_id unique)`

Todas las tablas tienen RLS y el esquema solo cambia mediante migraciones.

## Sincronización de correos

`pg_cron` llama cada hora a la Edge Function `sync-bac-emails`. La función:

1. Lee de Gmail los correos de los remitentes del BAC.
2. Los interpreta con `src/domain/bankEmail.ts`, el mismo parser que se prueba en Vitest.
3. Guarda cada transacción. `email_message_id` es único, así que nada se duplica.

Solo el cron puede llamarla: tiene que mandar un header `x-cron-secret` que coincida con el secreto guardado en Supabase Vault.

Secrets de la función: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.

> El rango de fechas está fijo en octubre 2026 (`DATE_RANGE` en `index.ts`). Hay que actualizarlo para traer correos más nuevos.

## Flujo de trabajo

No se escribe código sin spec. Cada feature vive en `docs/specs/TICKET-nombre/`:

1. `spec.md` (10–30 líneas): el **qué** y los criterios de aceptación `AC-n`.
2. `plan.md` (20–50 líneas): el **cómo**, sin código.
3. `task.md` (máx. 100 líneas): las tareas `TICKET-Tnn` como checkboxes.

Se trabaja con TDD (red → green → refactor), un commit por tarea y un test por cada criterio. Las reglas completas están en `Claude.md` y `docs/constitution.md`.
