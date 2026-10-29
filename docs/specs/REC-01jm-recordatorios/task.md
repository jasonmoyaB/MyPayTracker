# REC-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de PWA-01jm y TC-01jm–TC-06jm. Regla ponytail.

## Tareas
- [x] REC-01jm-T01 Prueba + migración `reminders` con RLS y `settings.card_notified_on`, sin aplicar [supabase/migrations/0010_reminders.sql] (AC-6)
  - Evidencia: rojo ENOENT al leer 0010_reminders.sql; verde 3/3 en src/data/reminders.test.ts; typecheck y test OK (324).
- [x] REC-01jm-T02 Prueba + `nextDueOn`, `reminderPhase`, `reminderNotification` y `dueOn` [src/domain/reminder.ts, src/domain/credit.ts] (AC-1, AC-2, AC-4)
  - Evidencia: rojo "Cannot find module ./reminder" y "dueOn is not a function"; verde 9/9 nuevas en reminder.test.ts y credit.test.ts; typecheck y test OK (333).
- [x] REC-01jm-T03 Prueba + `listReminders`/`addReminder`/`deleteReminder` [src/data/reminders.ts]
  - Evidencia: rojo "Cannot find module ./reminders"; verde 4/4 nuevas en src/data/reminders.test.ts; typecheck y test OK (337).
- [x] REC-01jm-T04 Prueba + pantalla Recordatorios: ruta, pestaña, fila de tarjeta, lista, formulario y borrar [src/ui/reminders/*, src/ui/route.ts, src/ui/AppShell.tsx, src/ui/App.tsx] (AC-1, AC-4)
  - Evidencia: rojo 4 fallos (ruta, 5 enlaces/íconos, pantalla en App) y "Cannot find module ./ReminderForm"; verde 6/6 en RemindersView.test.tsx + route/App/screenFocus; typecheck, test (346) y build OK.
- [x] REC-01jm-T05 Prueba + `notifyReminders` con reclamo atómico, antes del sync de Gmail; SW abre la URL del aviso [supabase/functions/sync-bac-emails/*, public/sw.js] (AC-2–AC-5)
  - Evidencia: rojo "Cannot find module ./reminders.ts" y SW abría siempre Movimientos; verde 8/8 en reminders.test.ts + pwa.test.ts + push.test.ts intacto; typecheck, test (354) y build OK.
- [x] REC-01jm-T06 Correcciones de review: recordatorios se cargan solo en su pantalla (si 0010 falta, solo esa pantalla falla); Borrar bloquea doble toque; descripción con maxLength 60 [src/ui/App.tsx, src/ui/reminders/*]
  - Evidencia: rojo 9 fallos (sin carga propia, sin "Cargando recordatorios…"/Reintentar, sin maxLength, App esperaba la lista); verde 3/3 nuevas en RemindersView.test.tsx + App/screenFocus; typecheck, test (357) y build OK.
- [x] REC-01jm-T07 Prueba + botón "Usar la deuda actual" junto al monto: llena lo que vence el próximo 20 (CRC) [src/ui/reminders/*]
  - Evidencia: rojo "sin botón Usar la deuda actual"; verde 359/359; typecheck, test y build OK.
- [x] REC-01jm-T08 Prueba + "Usar deuda actual" solo si la descripción habla de la tarjeta (`isCardPayment`, regex) [src/domain/reminder.ts, src/ui/reminders/ReminderForm.tsx]
  - Evidencia: rojo "isCardPayment is not a function"; verde 360/360; typecheck, test y build OK.
