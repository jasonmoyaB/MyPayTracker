# TC-02jm — Plan
## Migración `0008_installments.sql`
- Agrega a `transactions` la columna `installments smallint not null default 1`.
- Valores permitidos: 1, 3, 6, 10 o 12.
- Check: `installments = 1 or payment_method = 'credit'`.
- Filas existentes y cron quedan en 1. RLS no cambia.
## Dominio
- `src/domain/credit.ts`
  - `installmentDues(occurredAt, amountCents, n)`: cuotas `{ dueAt, cents }`.
    - La primera cae en `creditDueAt`; las siguientes, el 20 de cada mes siguiente.
    - El resto de centavos va en la primera.
  - `splitCredit` reparte cada compra con tarjeta por cuotas:
    - Cada cuota vencida entra a `settled` como gasto en su fecha.
    - Las pendientes suman a `pending`, que gana `scheduleCrc`: CRC por fecha de pago.
  - `nextPayDay(now)`: próximo día 20 en hora CR, incluido el día de hoy.
  - `dueBy(scheduleCrc, at)`: suma de lo que vence hasta esa fecha.
- `src/domain/recommend.ts` (nuevo, puro)
  - `PLANS`: efectivo y 1, 3, 6, 10, 12 meses.
  - `HEALTHY_SHARE = 0.3`.
  - `recommend({ priceCents, plan, balanceCents, extraCents, salaryCents, scheduleCrc, now })` devuelve:
    - el disponible tras el próximo pago;
    - la cuota;
    - la primera fecha;
    - el mes más cargado (agenda existente + nuevas cuotas);
    - un veredicto `si | ajustado | no`, más el motivo `pago | salario`.
## Datos
- `Transaction` y `NewTransaction` ganan `installments`; se leen y se escriben.
## UI
- **Formulario:** select "Plazo" (Un pago / Tasa cero N meses), visible solo con tarjeta. Con efectivo se guarda 1.
- **Fila:** "Tarjeta · tasa cero 6 meses · primera cuota el 20 nov".
- **`AffordCheck`:**
  - Nuevos campos: forma de pago y plata extra.
  - Muestra cuota, plazo y veredicto con su motivo.
  - Recibe saldo, salario, agenda y `now` en lugar del límite.
  - Los textos van en `affordText.ts`, puro y probado, para no pasar de 150 líneas.
- **`DashboardView` / `CreditCard`:**
  - Límite = saldo − `dueBy(próximo 20)`.
  - Aviso si el mes más cargado supera el salario.
## Decisiones
- Solo hay cuotas iguales, sin comisión: BAC cobra comisión según el plazo, pero el dev no la conoce. Queda anotado en un `ponytail:`.
- El límite deja de restar toda la deuda: las cuotas futuras salen del salario de esos meses y se juzgan aparte.
  Esto reemplaza la regla de TC-01jm, que restaba todo hoy.
## Pruebas
- `credit.test.ts`: cuotas (AC-1), `splitCredit` con plazos y `dueBy`.
- `recommend.test.ts`: AC-2, AC-3, AC-4 y el caso sin salario.
- `affordText`: textos de cada veredicto.
- Migración leída del disco (AC-5). Datos: `installments` en select e insert.
## Despliegue
`db push` de 0008 antes de desplegar la web.
