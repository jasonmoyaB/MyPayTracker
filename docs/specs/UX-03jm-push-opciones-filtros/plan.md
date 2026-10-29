# UX-03jm — Plan
## Notificaciones
- `src/ui/options/OptionsView.tsx`: monta `<PushToggle />` después de la tarjeta Apariencia.
- `src/ui/account/AccountView.tsx`: deja de montar `PushToggle`.
- `PushToggle` sigue en `src/ui/account/`, sin cambios, para no tocar imports ni pruebas existentes.
## Filtros
- `src/ui/transactions/transactions.css`
  - `.filter-fields`: `repeat(auto-fit, minmax(min(100%, 160px), 1fr))`. Una columna nunca pasa del contenedor;
    a 360px caben dos campos o bajan a otra fila.
  - `.filter-field input[type="date"]`:
    - `appearance: none` y `-webkit-appearance: none`, para que iOS deje de agrandarlo con su ancho intrínseco.
    - `display: block` y `min-height: 44px`.
  - El texto de la fecha queda alineado a la izquierda, como en los demás inputs.
## Decisiones
- Solo CSS: el solape viene del ancho intrínseco del date de iOS y de columnas de 150px fijos. No hay que cambiar marcado.
- Las notificaciones no se duplican en dos pantallas: un solo lugar, Opciones.
## Pruebas
- `OptionsView.test.tsx`: aparece "Notificaciones" (AC-1).
- `AccountView.test.tsx`: no aparece "Notificaciones" (AC-1).
- `filters.test.tsx`: lee `transactions.css` del disco y comprueba `min(100%` y `appearance: none` (AC-2, AC-3),
  igual que `screenFocus.test.tsx` hace con `shell.css`.
## Riesgos
- Quitar la apariencia nativa en iOS esconde el ícono de calendario. Tocar el campo sigue abriendo el selector nativo.
