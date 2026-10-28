# UI-01jm — Vistas

## Problema
Los movimientos ya están en Supabase, pero no hay pantalla para verlos ni para responder "¿puedo comprar esto?".

## Objetivo
Login + dashboard con saldo, "¿Puedo comprar esto?", salario, lista de movimientos y registro manual, siguiendo `docs/design/`.

## Criterios de aceptación
- AC-1 (A): login con email y contraseña de Supabase Auth; error claro si falla; `Cerrar sesión` en el header.
- AC-2 (B): saldo disponible en CRC = salario + ingresos CRC − gastos CRC; movimientos USD se muestran aparte, sin convertir.
- AC-3 (B): "¿Puedo comprar esto?" → "Sí, te quedarían ₡…" o "Te faltan ₡…".
- AC-4 (B): sin salario → estado vacío "Agrega tu salario para calcular tu saldo" con formulario; guardar salario actualiza el saldo.
- AC-5 (C): lista de movimientos con fecha, descripción, signo +/− y etiqueta Ingreso/Gasto (no solo color), importe alineado a la derecha.
- AC-6 (C): formulario manual (monto, moneda, tipo, descripción, fecha) → `source = 'manual'`; "Guardando…" sin envíos duplicados.
- AC-7: lógica nueva en `domain/` con test previo; `ui/` no importa `@supabase`.

## Fuera de alcance
Editar o borrar movimientos, filtros por mes, gráficos, tema oscuro, conversión USD→CRC.

## Supuestos
- Período del saldo: todos los movimientos guardados (hoy solo octubre). Selector de período queda para otra spec.
- Montos se escriben en unidades (3490.50) y se guardan en centavos.
