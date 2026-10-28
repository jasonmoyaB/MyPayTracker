# Fundamentos de UI/UX — MyPayTracker

## 1. Minimalismo con personalidad

La personalidad debe venir de un saldo protagonista, espacios generosos, tipografía clara y detalles petróleo. La variedad está en la escala y el ritmo, no en acumular colores, tarjetas o efectos.

## 2. Jerarquía del inicio

1. **Saldo disponible:** responder «¿cuánto puedo usar?» con el dato más visible y el período correspondiente.
2. **Ingresos y gastos:** resumen compacto que explique de dónde sale ese saldo.
3. **Acciones:** una acción principal visible por sección; dar acceso directo al registro de movimientos y a «¿Puedo comprar esto?».
4. **Últimos movimientos:** lista legible con fecha, descripción, dirección e importe.

Indicar cuándo se sincronizaron los datos bancarios. Si faltan movimientos o la sincronización falla, explicar que el saldo puede estar incompleto junto al resumen y al resultado de compra.

## 3. Tipografía y números

- Usar la fuente del sistema: `system-ui, -apple-system, "Segoe UI", sans-serif`. No requiere descargar tipografías.
- Texto base: `16px`, interlineado `1.5`. Metadatos: `14px`; etiquetas siempre legibles.
- Títulos de sección: `20–24px`, peso `600`.
- Saldo principal: `36–48px`, peso `600`, con ajuste para móvil e importes largos.
- Pesos habituales: `400` y `600`; evitar que todo esté en negrita.
- Importes con `font-variant-numeric: tabular-nums` y alineación derecha en listas.
- Formatear dinero con `Intl.NumberFormat` según moneda y configuración regional; no truncar cifras para hacerlas encajar.

## 4. Espacio y composición

- Escala de separación: `4, 8, 12, 16, 24, 32, 48px`.
- Márgenes laterales mínimos de `16px` en móvil y `24–32px` en escritorio.
- Contenido centrado con un ancho máximo orientativo de `1120px`.
- Una columna en móvil; en escritorio, distribuir resúmenes sin alterar el orden de lectura.
- Evitar tarjetas dentro de tarjetas. Agrupar información relacionada con espacio y títulos.
- A `320px` de ancho, permitir que etiquetas e importes se reorganicen sin desplazamiento horizontal de la página.

## 5. Componentes

| Componente | Regla |
| --- | --- |
| Tarjetas | Radio `12px`, padding `20–24px`, fondo blanco y borde decorativo suave |
| Botones | Altura mínima `44px`, radio `8px`, etiqueta con verbo claro |
| Campos | Altura mínima `44px`, etiqueta persistente, borde de control y ayuda cuando sea necesaria |
| Listas | Separadores suaves, espacio vertical suficiente y sin bordes alrededor de cada dato |
| Iconos | Una familia coherente, tamaño habitual `20px`; los decorativos se ocultan a lectores de pantalla |
| Sombras | Reservarlas para capas flotantes; diálogos con `0 8px 24px rgb(32 40 36 / 8%)` |

Los controles solo con iconos necesitan nombre accesible y un área interactiva mínima de `44 × 44px`. Los estados hover no sustituyen la interacción táctil ni el foco de teclado.

## 6. Estados e interacción

- **Cargando:** conservar la estructura, indicar «Cargando movimientos…» y no mostrar un saldo ficticio de cero.
- **Vacío:** explicar el siguiente paso: «Agrega tu salario para calcular tu saldo» con la acción correspondiente.
- **Guardando:** mostrar «Guardando…» e impedir envíos duplicados sin perder los datos introducidos.
- **Error:** decir qué ocurrió, conservar el formulario y ofrecer una acción concreta para recuperarse.
- **Éxito:** confirmación breve junto al elemento afectado; anunciarla con `role="status"` cuando corresponda.
- **Deshabilitado:** explicar el motivo cuando no sea evidente; no depender solo de una menor opacidad.
- **Teclado:** orden lógico, foco visible y restauración del foco al cerrar un diálogo.

Transiciones discretas de `120–180ms` para color y opacidad. Respetar `prefers-reduced-motion`; evitar contadores de dinero animados, rebotes y movimientos decorativos.

## 7. Voz de la interfaz

Tono directo, tranquilo y sin juicios sobre el gasto.

| Preferir | Evitar |
| --- | --- |
| «Saldo disponible» | «Tu poder financiero» |
| «Movimiento guardado» | «¡Increíble! ¡Lo lograste!» |
| «Te faltan ₡15 000 para esta compra» | «No puedes permitirte eso» |
| «No pudimos sincronizar. Reintentar» | «Error inesperado» sin siguiente paso |

## 8. Revisión al implementar una pantalla

- Se entiende el dato o la acción principal de un vistazo.
- Los importes y su período están claros; ingresos y gastos se distinguen sin color.
- Se reutilizan los tokens de [la paleta](./paleta-de-colores.md).
- Funciona con teclado, zoom al 200 % y viewport móvil de `320px`.
- Se contemplan carga, vacío, éxito y error según la tarea.
- El contenido sigue legible con importes grandes y textos largos.
