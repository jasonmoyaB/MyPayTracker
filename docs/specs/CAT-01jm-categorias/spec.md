# CAT-01jm — Categorías de gasto
## Objetivo
Hoy un gasto es solo su descripción ("AUTO MERCADO ESCAZU"). No sé en qué se me va la plata: súper, comida, transporte.
## Requisitos
- Cada gasto tiene una categoría de una lista fija: Súper, Comida, Transporte, Servicios, Salud, Compras,
  Entretenimiento, Otros.
- Se asigna sola: (1) la que yo le puse a mano; (2) si no, la última que puse a otro gasto con la misma descripción;
  (3) si no, por palabras conocidas del comercio; (4) si no, Otros.
- En Movimientos veo la categoría de cada gasto y la cambio con un selector; queda guardada en ese gasto.
- Los ingresos no tienen categoría.
## Restricciones
- Migración nueva: `transactions.category text` nula, con check en la lista fija. RLS de transactions sin cambios.
- La asignación es pura (domain) y no llama a IA. Los correos nuevos no necesitan cambio en el cron.
## Criterios de aceptación
- AC-1: gasto "AUTO MERCADO ESCAZU" sin categoría → Súper (palabras).
- AC-2: puse "Comida" a "SODA LA ESQUINA"; un gasto nuevo "SODA LA ESQUINA" sin categoría → Comida.
- AC-3: gasto con categoría guardada "Salud" → Salud aunque las palabras digan otra cosa.
- AC-4: "COMERCIO DESCONOCIDO" sin categoría ni historial → Otros.
- AC-5: cambiar la categoría en Movimientos la guarda y la lista la muestra al recargar.
## Supuestos
- Lista fija y no por usuario (un solo dueño); se agregan categorías con una migración si hace falta.
- La descripción se compara sin mayúsculas, tildes ni espacios extra.
