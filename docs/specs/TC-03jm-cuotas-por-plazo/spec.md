# TC-03jm — Cuota mensual por cada plazo
## Objetivo
En "¿Puedo comprar esto?" el dev quiere ver de un vistazo cuánto pagaría cada mes según el plazo
(un pago, tasa cero 3, 6, 10 o 12 meses) para elegir el que le conviene, sin probar uno por uno.
## Requisitos
- Al calcular con un precio válido, además de la recomendación del plazo elegido, se muestra una tabla:
  plazo, cuota al mes, primer pago y recomendación (Sí / Ajustado / No) de cada plazo con tarjeta.
- La tabla usa el mismo cálculo y los mismos datos que la recomendación (saldo, plata extra, salario, cuotas ya agendadas).
- La cuota mostrada es la primera (lleva el resto de centavos); las demás son iguales o un céntimo menor.
## Restricciones
- Sin lógica nueva de negocio: reutiliza `recommend` de TC-02jm. Centavos enteros, solo CRC.
- Tabla accesible: `<table>` con `<caption>` y encabezados `<th scope="col">`.
## Criterios de aceptación
- AC-1: precio ₡200 000, salario ₡150 000, sin deuda, compra entre corte y pago → filas
  un pago ₡200 000 No · 3 meses ₡66 666,68 Ajustado · 6 meses ₡33 333,35 Sí · 10 meses ₡20 000 Sí · 12 meses ₡16 666,74 Sí.
- AC-2: con precio inválido no se muestra la tabla.
## Supuestos
- Se omite "Efectivo o débito" en la tabla: no tiene cuotas.
