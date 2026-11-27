# META-01jm — Metas de ahorro
## Objetivo
Quiero juntar plata para algo ("₡500 000 para diciembre") y saber cuánto apartar cada mes para llegar.
## Requisitos
- En Opciones creo una meta: nombre, monto objetivo, moneda (CRC o USD), fecha límite (mes) y lo ahorrado hasta hoy.
- Puedo actualizar lo ahorrado y borrar la meta.
- En el Resumen, una tarjeta "Metas" muestra por meta: ahorrado / objetivo, barra, y "Aparta ₡X al mes" hasta la fecha.
- Si ya llegué al objetivo dice "¡Meta cumplida!"; si la fecha pasó sin llegar dice "Venció: te faltan ₡X".
## Restricciones
- Migración nueva: tabla `savings_goals(id, user_id, name, target numeric(12,2) > 0, currency, deadline date,
  saved numeric(12,2) >= 0, created_at)` con RLS del dueño (leer, crear, actualizar `saved`, borrar).
- Cálculo puro en domain; centavos enteros; CRC y USD de cada meta por separado (nunca se suman entre metas).
## Criterios de aceptación
- AC-1: objetivo ₡500 000, ahorrado ₡100 000, hoy 27 nov 2026, límite dic 2026 → 2 meses → "Aparta ₡200 000 al mes".
- AC-2: el aporte se redondea hacia arriba al céntimo (₡100 000 en 3 meses → ₡33 333,34).
- AC-3: ahorrado ≥ objetivo → "¡Meta cumplida!".
- AC-4: límite oct 2026 y hoy nov 2026 sin llegar → "Venció: te faltan ₡X".
- AC-5: sin metas, la tarjeta no aparece en el Resumen.
## Supuestos
- Lo ahorrado se actualiza a mano y no baja "Puedes gastar" (es plata que ya separé fuera de la cuenta).
- Meses restantes cuentan el mes en curso y el de la fecha límite.
- `deadline` se guarda como el día 1 del mes límite (check en la BD); nombre de 1 a 80 caracteres.
- No hay Supabase local: la migración 0020 se prueba como texto (como 0017) y no se aplica en esta entrega.
- "Ahorrado" acepta 0 (reutiliza `parseFeeToCents`); el mes límite se valida con `parseMonth`. La tarjeta "Metas"
  va después de "Presupuestos"; Opciones recarga con el mismo `reload` que presupuestos.
