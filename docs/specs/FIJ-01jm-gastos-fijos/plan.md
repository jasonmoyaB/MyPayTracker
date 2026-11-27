# FIJ-01jm — Plan
## Migración `00NN_reminders_reserve.sql`
- `alter table reminders add column reserve boolean not null default false;`
- `grant update (reserve) on reminders to authenticated;` + policy de update del dueño si no existe (ver 0011).
## Domain (`src/domain/reminder.ts`)
- `reservedCents(reminders, now)`: suma CRC de los `reserve` no tarjeta (`isCardPayment(description)`) cuyo
  vencimiento de este mes no está pagado. Vencimiento del mes = día recortado al largo del mes (misma regla de
  `nextDueOn`); pagado = `paidOn >= ese vencimiento`. Un día ya pasado y sin `paidOn` sigue apartado (supuesto 2).
## Data (`src/data/reminders.ts`)
- `Reminder.reserve`; `addReminder` lo envía; `setReminderReserve(id, reserve)`.
## UI
- `ReminderForm`: casilla "Apartar del saldo". Lista de Recordatorios: casilla por fila.
- `DashboardView`: `limitCents = saldo − dueNext − reservedCents(reminders, now)`; `AffordCheck` recibe el saldo
  ya con la reserva. Los recordatorios llegan como hoy llegan a Recordatorios (cargar en el shell si hace falta).
## MCP
- `ledger` también trae `reminders` (amount, currency, day, paid_on, reserve, description); `puedo_comprar` resta
  `reservedCents` igual que la app.
## Pruebas
- `reminder.test.ts`: AC-1..AC-5.
- `reminders.test.ts` (data): reserve en select/insert/update.
- `DashboardView.test.tsx`: "Puedes gastar" baja con un recordatorio apartado.
- `tools.test.ts`: `puedo_comprar` resta la reserva.
## Riesgos
- Recordatorios ya cargados solo en Recordatorios: el Resumen y AffordCheck necesitan la misma lista (una sola carga).
