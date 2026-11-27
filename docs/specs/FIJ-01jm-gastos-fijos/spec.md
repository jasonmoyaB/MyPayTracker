# FIJ-01jm — Gastos fijos que apartan su monto
## Objetivo
Alquiler, internet o Netflix ya los tengo como recordatorios, pero "Puedes gastar" no los descuenta hasta que los
pago. Me dice que puedo gastar plata que ya está comprometida.
## Requisitos
- Un recordatorio se puede marcar "Apartar del saldo" (al crearlo o después, desde Recordatorios).
- "Puedes gastar" (Resumen), "¿Puedo comprar esto?" (app y conector MCP) restan los recordatorios marcados que
  vencen de hoy a fin de mes (hora CR) y no están pagados.
- Al marcar un recordatorio como pagado (REC-02jm) deja de apartarse ese mes.
- Los recordatorios de la tarjeta no se apartan: su pago ya se resta como cuotas.
## Restricciones
- Migración nueva: `reminders.reserve boolean not null default false`, con privilegio de update solo a esa columna
  para el dueño (como `paid_on` en 0011). Solo CRC (USD se muestra aparte y no se suma).
- Cálculo en domain, compartido por app y MCP.
## Criterios de aceptación
- AC-1: hoy 10 nov, alquiler ₡200 000 día 28 apartado, sin pagar → "Puedes gastar" baja ₡200 000.
- AC-2: el mismo, marcado pagado el 28 nov → no baja.
- AC-3: internet día 5 apartado y marcado pagado el 5 nov, hoy 10 nov → no se aparta en nov.
- AC-4: recordatorio "Tarjeta BAC" apartado → no se aparta.
- AC-5: un recordatorio sin "Apartar" → no cambia nada.
## Supuestos
- Horizonte = fin del mes en curso; lo del mes siguiente sale del salario de ese mes.
- Un recordatorio vencido y sin pagar de este mes sigue apartado hasta marcarlo pagado.
