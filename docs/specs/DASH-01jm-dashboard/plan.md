# DASH-01jm — Plan

## Base
spec.md de esta carpeta. Reutiliza `summary.ts` (summarize/summarizeFromAccount), `BalancePanel`,
`AffordCheck`, `MoneySetting`, `TransactionsPanel`, `ChangePasswordView` (AUTH-01jm), `autoRefresh`.

## Módulos

### 1. Dominio (`src/domain/monthStats.ts`)
- `costaRicaMonth(now)` → inicio y fin (exclusivo) del mes en −06:00.
- `monthStats(movements, now)` → `{ incomeCents, expenseCents, netCents }` solo CRC del mes.
- `topExpenses(movements, now, n = 3)` → `[{ description, cents }]` agrupado por descripción exacta, desc.
- `lastEmailMovement(movements)` → el `occurredAt` más reciente con `source` de correo.

### 2. Navegación (`src/ui/route.ts` + `src/ui/AppShell.tsx`)
- `parseRoute(hash)` → `'resumen' | 'movimientos' | 'cuenta'` (desconocido → resumen). Probado.
- `useRoute()` escucha `hashchange`; enlaces `<a href="#/movimientos">` (atrás/adelante gratis).
- Barra: abajo fija en móvil (≤ 640 px), arriba en escritorio; `aria-current="page"` en la activa.

### 3. Pantallas
- `src/ui/dashboard/DashboardView.tsx`: tarjeta saldo (de `BalancePanel` sin los ajustes),
  tarjetas mes (ingresos/gastos/neto), top gastos, últimos 5 + "Ver todos", última lectura, `AffordCheck`.
- `src/ui/account/AccountView.tsx`: `MoneySetting` saldo y salario, `ChangePasswordView`,
  hueco para el interruptor de notificaciones (PWA-01jm).
- Movimientos: `TransactionsPanel` actual (MOV-01jm le agrega filtros).
- `BalancePanel` se divide: cálculo de saldo reutilizable vs. ajustes que pasan a Cuenta.

### 4. `App.tsx`
- `Dashboard` carga datos una vez (igual que hoy) y los pasa a la pantalla activa vía `AppShell`.
- El encabezado conserva tema y cerrar sesión; el enlace provisional de contraseña se quita.

## Riesgos
- Mover `MoneySetting` cambia pruebas existentes de `BalancePanel`: se actualizan, no se borran.
- Archivos < 150 líneas: separar tarjetas del Resumen en componentes pequeños.
