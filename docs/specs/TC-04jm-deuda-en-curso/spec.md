# TC-04jm — Deuda de tarjeta que ya venía pagando
## Objetivo
El card "Tarjeta de crédito" muestra "Deuda pendiente: ₡0" porque la app solo conoce las compras registradas en ella.
El dev quiere cargar ahí mismo lo que ya debe: cada compra (producto, precio, plazo de tasa cero) y cuánto le
queda por pagar, para que la deuda, el próximo pago y "Puedes gastar" sean reales.
## Requisitos
- En el card, un formulario plegable "Agregar deuda que ya tenías": Producto, Precio, Plazo (Un solo pago /
  Tasa cero 3, 6, 10 o 12 meses) y "Te queda por pagar" (opcional; vacío = el precio).
- Cuota = precio ÷ meses. Lo que queda se paga en cuotas iguales: tantas como cuotas quepan en lo que queda (redondeo
  hacia arriba, máximo el plazo). El resto de centavos va en la primera, como en TC-02jm.
- La primera cuota de lo que queda vence el **próximo día de pago** (20), aunque hoy esté entre el corte y el pago.
- Al guardar, la deuda pendiente, el próximo pago y "Puedes gastar" se actualizan sin recargar la página.
- Las compras nuevas siguen la regla de TC-01jm: compra el 29 oct → paga el 20 nov; compra el 7 nov → paga el 20 dic.
## Restricciones
- Centavos enteros (`parseAmountToCents`); solo CRC. RLS intacto. Esquema solo por migración nueva `0009`.
- Sin tablas ni dependencias nuevas: es una compra con tarjeta más en `transactions`.
## Criterios de aceptación
- AC-1: hoy 29 oct, ₡120 000 a 12 meses, queda ₡60 000 → 6 cuotas de ₡10 000 desde el 20 nov; deuda ₡60 000 y
  "Puedes gastar" baja solo ₡10 000.
- AC-2: hoy 15 nov, mismo caso → primera cuota el 20 nov (no el 20 dic).
- AC-3: un solo pago de ₡50 000 hoy 29 oct → vence el 20 nov.
- AC-4: ₡100 000 a 3 meses, queda ₡50 000 → 2 cuotas de ₡25 000.
- AC-5: "queda" mayor que el precio, precio inválido o producto vacío → error y no se guarda.
## Supuestos
- "Deuda pendiente" es la suma de lo registrado: una deuda suelta se carga como "Un solo pago" (evita contarla dos veces).
- Corte el 6 **inclusive** y pago el **20** (no el 21), como TC-01jm: es lo conservador, la deuda vence antes.
- La deuda cargada aparece en Movimientos y en "Gastos este mes" del mes en que se carga (no se conoce su fecha real).
