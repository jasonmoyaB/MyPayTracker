# UX-05jm — Card de tarjeta más ordenado
## Objetivo
El card "Tarjeta de crédito" se volvió una pila de frases largas (corte, pago, deuda, total del 20, límite, aviso,
productos). El dev quiere leerlo de un vistazo: menos texto y cada dato en su lugar.
## Requisitos
- Encabezado: título y, a la derecha, "Corte 6 nov · Pago 20 nov" en texto secundario.
- Dos cifras en recuadros como "Este mes": "Deuda total" y "Pagas el 20 nov".
- Límite en una frase corta: "Puedes gastar ₡X" o "Al pagar te faltarían ₡X"; aviso de salario igual de corto.
- Productos como la lista de "Últimos movimientos": nombre y "6 cuotas · próxima ₡10 000 el 20 nov" a la izquierda,
  lo que falta a la derecha.
- "Agregar deuda que ya tenías" sigue plegado al final.
## Restricciones
- Sin lógica nueva, dependencias, animaciones ni `backdrop-filter`: UX-04jm se revirtió por lag al hacer scroll.
- Reutiliza `.dashboard-heading`, `.dashboard-month`, `.dashboard-list` y los tokens de color; tema claro y oscuro.
- Mismos datos que hoy; el color nunca es la única señal (texto y signo dicen lo mismo).
## Criterios de aceptación
- AC-1: con deuda se ven encabezado con fechas, los dos recuadros, el límite y la lista; sin deuda solo encabezado,
  "Deuda total ₡0", el límite y el formulario.
- AC-2: las pruebas de TC-01jm, TC-02jm y TC-05jm siguen cubriendo los mismos datos con los textos nuevos.
## Supuestos
- Se omite lo de la skill gpt-taste que es de landing pages (GSAP, hero, bento con imágenes): no aplica a un card y
  el rediseño animado anterior se revirtió.
