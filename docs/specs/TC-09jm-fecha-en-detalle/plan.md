# TC-09jm — Plan
1. **`src/ui/format.ts`**: `formatDayYear(iso)` con `Intl` (`dateStyle: medium`, zona CR).
2. **`src/ui/dashboard/CreditCard.tsx`**: línea `muted` "Comprado el …" bajo el título del `<dialog>`, con `p.occurredAt`.
## Decisiones
- Formatter nuevo en vez de cambiar `formatDay`: los días de pago siguen sin año.
