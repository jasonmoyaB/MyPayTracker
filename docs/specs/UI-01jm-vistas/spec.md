# UI-01jm — Vistas

## Problema
Los movimientos ya se guardan, pero no hay pantalla para verlos ni para saber si alcanza para una compra.

## Objetivo
Una pantalla de inicio que responda "¿cuánto puedo usar?" y "¿puedo comprar esto?", y permita registrar gastos a mano.

## Requisitos de usuario
- Entrar con mi correo y contraseña.
- Ver mi saldo disponible, mis ingresos y gastos, y la lista de movimientos.
- Registrar mi salario y movimientos manuales (compras con tarjeta de crédito).

## Criterios de aceptación
- AC-1: login con correo y contraseña; error claro si falla; botón para cerrar sesión.
- AC-2: saldo disponible en colones = salario + ingresos − gastos en colones; lo que está en dólares se muestra aparte, sin convertir.
- AC-3: "¿Puedo comprar esto?" responde "Sí, te quedarían ₡…" o "Te faltan ₡…".
- AC-4: sin salario → mensaje "Agrega tu salario para calcular tu saldo"; al guardarlo, el saldo se actualiza.
- AC-5: cada movimiento muestra fecha, descripción, signo +/− y la palabra Ingreso o Gasto (no solo color), con el monto a la derecha.
- AC-6: formulario manual (monto, moneda, tipo, descripción, fecha); muestra "Guardando…" y no permite enviar dos veces.
- AC-7: sigue `docs/design/`: tokens de color, accesible con teclado, usable a 320px.

## Fuera de alcance
Editar o borrar movimientos, filtros por mes, gráficos, tema oscuro, conversión de dólares.

## Supuestos
- El período del saldo son todos los movimientos guardados.
