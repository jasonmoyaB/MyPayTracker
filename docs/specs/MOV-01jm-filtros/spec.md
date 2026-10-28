# MOV-01jm — Filtros de movimientos por fecha y tipo

## Problema
La lista de movimientos muestra todo junto; no se puede ver un período concreto ni cuánto entró y salió en él.

## Objetivo
Filtrar movimientos por rango de fechas y por tipo, y ver los totales positivos y negativos del resultado.

## Requisitos de usuario
- Elegir "desde" y "hasta" y ver solo esos movimientos.
- Ver solo ingresos, solo gastos o ambos.
- Ver la suma de ingresos (positivo), gastos (negativo) y el neto del filtro.

## Criterios de aceptación
- AC-1: campos "Desde" y "Hasta" (fecha); ambos días se incluyen completos en hora de Costa Rica.
- AC-2: selector de tipo: Todos, Ingresos, Gastos.
- AC-3: accesos rápidos: Este mes, Mes pasado, Últimos 7 días, Todo.
- AC-4: sobre la lista: total de ingresos con signo +, total de gastos con signo −, y neto, en colones; USD aparte si hay.
- AC-5: "Desde" posterior a "Hasta" muestra un error junto al campo y no filtra.
- AC-6: un filtro sin resultados muestra "No hay movimientos con estos filtros" y un botón para limpiarlos.
- AC-7: filtrar no cambia el saldo disponible del Resumen.
- AC-8: el filtro elegido se mantiene al cambiar de pantalla y volver (durante la sesión).

## Restricciones
- Lógica de filtro y totales en `src/domain` con pruebas; montos en centavos.

## Fuera de alcance
Búsqueda por texto, exportar a Excel, filtros por categoría.

## Supuestos
- Filtrado en el navegador sobre los movimientos ya cargados (uso personal, pocos cientos de filas).
- Filtro inicial: Este mes, Todos.
