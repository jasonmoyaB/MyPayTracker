# UX-07jm — Plan
1. **`src/ui/dashboard/CreditCard.tsx`**: el `<form method="dialog">` del detalle usa la clase `dialog-actions`;
   orden Eliminar → Cerrar (`secondary`) → Editar/Cancelar.
2. **`src/ui/dashboard/dashboard.css`**: `.dialog-actions` = grid en columnas iguales (`grid-auto-flow: column`,
   `grid-auto-columns: 1fr`), `gap` 8 px; botones `nowrap` y `min-height: 44px`.
## Decisiones
- Grid en vez de flex: tres botones exactamente iguales, sin depender del largo del texto.
