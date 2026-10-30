# SIM-01jm — Cuánto te queda libre cada mes con cuotas
## Objetivo
"¿Puedo comprar esto?" ya compara plazos (TC-02jm, TC-03jm), pero solo da la cuota y el peor mes.
El dev quiere ver, mes a mes, cuánto le queda libre si compra a cuotas, para decidir con números concretos.
## Requisitos
- Al calcular con tarjeta (un pago o tasa cero), debajo del veredicto sale una tabla con una fila por cada
  cuota de la compra nueva: mes (fecha del 20), cuotas que paga ese mes (las que ya tenía + la nueva) y lo que le queda libre.
- Libre del próximo 20 = saldo de hoy + plata extra − todo lo que vence hasta ese 20 (el mismo `leftCents` de hoy).
- Libre de los meses siguientes = salario − todas las cuotas que vencen ese 20.
- Un mes con libre negativo se marca en rojo.
- Sin salario registrado, los meses siguientes muestran "—" y el aviso actual de registrar el salario.
- Con "Efectivo o débito" no hay tabla (no hay cuotas).
## Restricciones
- Reutiliza `recommend` / `installmentDues`: sin tablas, migraciones ni RPC nuevas. Centavos enteros, solo CRC.
- Tabla accesible: `<table>` con `<caption>` y `<th scope="col">`; en móvil no rompe el ancho.
## Criterios de aceptación
- AC-1: precio ₡30 000 a 3 meses, salario ₡150 000, saldo ₡150 000, ya agendado ₡50 000 el 20 nov y ₡100 000 el 20 dic,
  compra el 10 nov → filas 20 dic: cuotas ₡110 000, libre ₡40 000 · 20 ene: ₡10 000, libre ₡140 000 · 20 feb: ₡10 000, libre ₡140 000.
- AC-2: compra el 3 oct en un pago de ₡200 000 con saldo ₡150 000 → fila 20 oct con libre −₡50 000 en rojo.
- AC-3: sin salario, los meses posteriores al próximo 20 muestran "—".
- AC-4: con efectivo o precio inválido no se muestra la tabla.
## Supuestos
- Plazos: los mismos de BAC (1, 3, 6, 10, 12); no se abre un plazo libre (0009 permite 1–12, pero BAC no ofrece todos).
- "Libre" no resta gastos variables (comida, etc.): la app no tiene gastos recurrentes; solo salario − cuotas de tarjeta.
- Recordatorios (0010) no se restan: no son deuda registrada y podrían duplicar un gasto.
- USD no entra (cuotas en USD van aparte; nunca se suman a CRC).
- El salario se asume recibido antes de cada 20, igual que hoy en `recommend`.
