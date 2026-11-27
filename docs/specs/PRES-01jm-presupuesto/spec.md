# PRES-01jm — Presupuesto por categoría
## Objetivo
Quiero ponerme un tope por categoría ("Súper ₡80 000 al mes") y enterarme antes de pasarme.
## Requisitos
- En Opciones defino un presupuesto mensual en colones por categoría (CAT-01jm); lo puedo cambiar o quitar.
- En el Resumen, una tarjeta "Presupuestos" muestra por categoría: gastado este mes / tope y una barra.
- Lo gastado usa la misma regla que los gastos del mes (GAS-01jm: cuotas en su mes, sin pagos de tarjeta).
- Al llegar al 80 % de un tope recibo un push una sola vez por categoría y mes; al pasar el 100 %, otro.
## Restricciones
- Migración nueva: tabla `budgets(user_id, category, amount numeric(12,2) > 0)`, PK `(user_id, category)`, RLS
  del dueño, con marcadores de aviso por mes. Solo CRC.
- El push lo manda el cron con el reclamo atómico existente (mismo patrón de `reminders.ts`).
## Criterios de aceptación
- AC-1: tope Súper ₡80 000, gastado ₡64 000 → 80 %, barra y push "Súper: llevas ₡64 000 de ₡80 000".
- AC-2: otra pasada del cron el mismo mes con ₡70 000 → no repite el push del 80 %.
- AC-3: gastado ₡81 000 → push del 100 % una vez.
- AC-4: el mes siguiente se vuelve a avisar.
- AC-5: sin presupuestos no se muestra la tarjeta.
## Supuestos
- Barra accesible: texto con el porcentaje, no solo color. Sin presupuesto en USD.
- El número de la migración es el siguiente libre al implementarla.
- El dueño tiene update de `(category, amount)` porque el upsert reescribe ambas; los marcadores solo los escribe el cron.
- PRES-01jm-T07: el "solo tabla no existe" se decide en `listBudgets` (data), no en `App.tsx`, para no meter lógica en la UI.
