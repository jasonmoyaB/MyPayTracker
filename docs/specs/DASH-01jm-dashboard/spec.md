# DASH-01jm — Pantalla de resumen (dashboard) y navegación

## Problema
Todo está en una sola página larga: saldo, ajustes y movimientos mezclados; no se ve de un vistazo lo más importante.

## Objetivo
Separar la app en tres pantallas — Resumen, Movimientos y Cuenta — con un Resumen que muestre la información clave del mes.

## Requisitos de usuario
- Abrir la app y ver de inmediato cuánto tengo, cuánto entró y salió este mes y en qué gasto más.
- Moverme entre pantallas con una barra de navegación cómoda en el teléfono.

## Criterios de aceptación
- AC-1: navegación con tres secciones (Resumen, Movimientos, Cuenta); la sección activa se marca y sobrevive a recargar la página y al botón atrás.
- AC-2: Resumen muestra el saldo disponible en colones (misma regla que hoy, BAL-01jm) y USD aparte.
- AC-3: Resumen muestra ingresos, gastos y neto del mes en curso (hora de Costa Rica) en colones.
- AC-4: Resumen muestra los 3 comercios/descripciones con más gasto del mes y su monto.
- AC-5: Resumen muestra los últimos 5 movimientos y un enlace "Ver todos" a Movimientos.
- AC-6: Resumen muestra cuándo entró el último movimiento leído del correo.
- AC-7: "¿Puedo comprar esto?" sigue disponible en Resumen.
- AC-8: Cuenta reúne: saldo actual en BAC, salario, cambiar contraseña y notificaciones (PWA-01jm).
- AC-9: sin movimientos en el mes, cada bloque muestra un estado vacío claro.

## Restricciones
- Sin librería de rutas: navegación por `#hash`.
- Cálculos en `src/domain` con pruebas; montos en centavos.

## Fuera de alcance
Gráficos, presupuestos por categoría, comparación entre meses.

## Supuestos
- "Comercio" = texto de descripción del movimiento tal cual (sin agrupar variantes).
- Sección inicial: Resumen.
