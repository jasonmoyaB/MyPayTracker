# TC-06jm — Plan
## Dominio — `src/domain/credit.ts`
- `pendingPurchases` devuelve también `dues`: las cuotas pendientes (`{ dueAt, cents }`) que ya calcula con
  `installmentDues`. Nada más cambia.
## UI — `src/ui/dashboard/CreditCard.tsx`
- Cada `<li>` envuelve su contenido en un `<button type="button" aria-haspopup="dialog">` que hace `showModal()`
  sobre su `<dialog>` (ref por fila, componente `PurchaseRow` en el mismo archivo).
- `<dialog>`: `<h3>` nombre, "Falta ₡X", `<table>` (Fecha, Cuota) y `<form method="dialog"><button>Cerrar</button>`:
  el cierre y la vuelta del foco los hace el navegador.
- `dashboard.css`: `.dashboard-row-button` quita el estilo de botón primario (fondo, borde, padding) y ocupa la
  fila; conserva el anillo de foco.
## Decisiones
- `<dialog>` nativo en lugar de un modal propio: foco atrapado, Esc y capa superior gratis (ponytail).
- El estilo de vidrio de `dialog` ya existe en `theme.css`; solo se pinta mientras está abierto.
## Pruebas
- `credit.test.ts`: `dues` en `pendingPurchases`.
- `DebtForm.test.tsx` (card): botón con `aria-haspopup` y tabla con las fechas (AC-1, AC-2).
