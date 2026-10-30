# TC-08jm — Editar una deuda
## Objetivo
Una deuda ya guardada no se puede corregir: para ponerle la fecha de compra (TC-07jm), cambiar el precio, el plazo o
el nombre hay que borrarla y volver a crearla.
## Requisitos
- En el detalle de cada producto en deuda, un botón "Editar" junto a "Cerrar" y "Eliminar deuda".
- Abre el mismo formulario de "Agregar deuda" con lo guardado: producto, precio (= monto guardado), plazo
  (= cuotas guardadas) y fecha de compra (= fecha guardada). Mismas validaciones y cálculos que al agregar.
- Al guardar se actualiza esa misma deuda (no se crea otra) y el card se refresca sin recargar.
## Restricciones
- Centavos enteros; solo deudas en CRC (el formulario es solo CRC); RLS intacto. Sin migración.
- Se actualiza solo la fila elegida, por su id; nunca cambia moneda, dirección ni método de pago.
## Criterios de aceptación
- AC-1: deuda "Tele" ₡60 000 en 6 cuotas → el formulario de edición trae Tele, 60000, 6 y su fecha.
- AC-2: guardar con fecha 10 sep, ₡120 000 a 3 meses → actualiza esa fila con precio 120 000, 3 cuotas y esa fecha.
- AC-3: datos inválidos → error y no se guarda (mismas reglas que TC-04jm/TC-07jm).
## Supuestos
- La fecha guardada de una deuda cargada sin fecha es el día en que se cargó; al editar se puede cambiar por la real.
- Si las cuotas guardadas no son un plazo de BAC (p. ej. 7, por la cuota mensual de TC-05jm), el plazo se ofrece igual.
- Deudas en dólares no muestran "Editar".
