# UX-04jm — Rediseño glassmorphism profesional y minimalista

## Problema
UX-01jm añadió vidrio sobre la interfaz existente, pero la composición sigue siendo una pila de tarjetas iguales: el saldo no domina, la navegación parece una barra de formulario y los controles tienen un aire genérico.

## Objetivo
Rediseño visual completo: más sobrio, con jerarquía clara y vidrio refinado, sin cambiar qué hace la app ni sus textos.

## Requisitos de usuario
- El saldo disponible es el protagonista del Resumen, con mucho aire y número grande.
- El Resumen se ordena en una cuadrícula tipo bento sin huecos en escritorio y en una columna en móvil.
- Navegación como píldora de vidrio flotante (arriba en escritorio, flotante abajo en móvil).
- Encabezado, botones, campos, filtros, listas, tabla, toasts y login con el mismo lenguaje: radios amplios, bordes finos, sombras suaves.
- Tipografía con más carácter (Geist) y números tabulares.
- Movimiento discreto: entrada escalonada de las tarjetas y respuesta al pasar el cursor.

## Criterios de aceptación
- AC-1: contraste AA (≥ 4.5:1) del texto sobre cada vidrio y cada mancha del fondo, en claro y oscuro.
- AC-2: la cuadrícula del Resumen usa `grid-auto-flow: dense` y sus anchos suman filas completas, también sin la tarjeta «¿Puedo comprar esto?».
- AC-3: sin desplazamiento horizontal a 320 px; objetivos táctiles ≥ 44 px.
- AC-4: con `prefers-reduced-motion` no hay animaciones; con menos transparencia o sin `backdrop-filter`, superficies opacas.
- AC-5: los tests y el typecheck existentes siguen pasando.

## Restricciones
- Sin dependencias npm nuevas (nada de GSAP: CSS basta). La fuente se carga de Google Fonts con fallback del sistema.
- Sin cambios en domain, data ni en el comportamiento de la UI.

## Fuera de alcance
Nuevas pantallas, imágenes decorativas, gráficos.
