# UX-03jm — Notificaciones en Opciones y filtros de fecha sin encimarse
## Objetivo
El dev no encuentra cómo activar las notificaciones (busca en Opciones, donde están los demás ajustes) y en
Movimientos los campos "Desde" y "Hasta" quedan uno encima del otro en el teléfono.
## Requisitos
- La tarjeta "Notificaciones" (activar/desactivar push) pasa de Cuenta a Opciones, después de Apariencia.
- Cuenta queda solo con saldo y salario.
- En móvil, "Desde", "Hasta" y "Tipo" nunca se solapan: cada campo ocupa su ancho y, si no caben, baja a otra fila.
- El campo de fecha de iOS (que ignora `width` y se agranda solo) respeta el ancho de su columna.
## Restricciones
- Sin lógica nueva: se reutiliza `PushToggle` tal cual. Solo CSS para los filtros, sin dependencias.
- Mantener accesibilidad: labels asociados y objetivos táctiles ≥ 44px.
## Criterios de aceptación
- AC-1: Opciones muestra "Notificaciones"; Cuenta ya no.
- AC-2: `.filter-fields` usa columnas que nunca son más anchas que el contenedor (`minmax(min(100%, …), 1fr)`).
- AC-3: los `input[type=date]` del filtro anulan la apariencia nativa de iOS (`appearance: none`) y ocupan el 100 %.
## Supuestos
- Si en iPhone sigue sin salir el botón, es porque la app no se abrió desde el icono instalado (requisito de Apple).
