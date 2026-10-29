# UX-05jm — Plan
## UI — `src/ui/dashboard/CreditCard.tsx`
- Encabezado `.dashboard-heading`: `<h2>` + `<p class="muted">` con `nextCutAt` y `pending.dueAt`.
- `<dl class="dashboard-month">`: "Deuda total" (`pending.crcCents`) y, con deuda, "Pagas el <nextPayDay>"
  (`dueNextCents`). Deuda en USD como línea secundaria aparte, como hoy.
- `LimitLine` y `SalaryLine` con textos cortos; mismas condiciones.
- Productos en `<ul class="dashboard-list">`: `.dashboard-text` (nombre + detalle muted) y `.amount` a la derecha.
- `DebtForm` sin cambios.
## Decisiones
- Cero CSS nuevo: todo sale de clases que ya usan los otros cards, así se ve igual que el resto del Resumen.
- Sin cambios en dominio ni datos.
## Pruebas
- Actualizar textos en `DashboardView.test.tsx` y `DebtForm.test.tsx` (AC-2); comprobar los recuadros (AC-1).
