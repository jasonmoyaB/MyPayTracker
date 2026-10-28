# UX-01jm — Diseño glassmorphism y favicon con el logo

## Problema
La interfaz usa tarjetas opacas planas y la pestaña del navegador no tiene icono propio.

## Objetivo
Darle a toda la app un estilo glassmorphism (paneles translúcidos con desenfoque sobre un fondo de color suave) y usar el logo subido como favicon e icono.

## Requisitos de usuario
- Paneles, encabezado, formularios y diálogos con efecto vidrio en tema claro y oscuro.
- El símbolo verde del logo como favicon y como icono al guardar la web en el teléfono.
- El logo horizontal visible en la pantalla de login.
## Criterios de aceptación
- AC-1: las superficies (tarjetas, encabezado, formularios) son translúcidas con desenfoque y borde claro sutil, en ambos temas.
- AC-2: texto y controles mantienen contraste AA (4.5:1 texto normal) sobre el vidrio.
- AC-3: si el navegador no soporta desenfoque o el usuario pide menos transparencia, las superficies son opacas.
- AC-4: la pestaña muestra el símbolo del logo; existen iconos de 32, 180, 192 y 512 px derivados de él.
- AC-5: las imágenes originales pesadas no se publican tal cual; se sirven versiones optimizadas.
- AC-6: el login muestra el logo horizontal.
## Restricciones
- Sin dependencias nuevas; solo CSS y archivos estáticos.
- Se mantiene el modo claro/oscuro existente (THEME-01jm) y `prefers-reduced-motion`.
## Fuera de alcance
Rediseño de la estructura de pantallas (DASH-01jm), animaciones decorativas.
## Supuestos
- El pedido explícito del usuario reemplaza la regla "sin degradados ni brillos" de `docs/design/paleta-de-colores.md`; se actualiza ese documento.
- Símbolo para favicon: `Símbolo financiero verde sobre marfil.png`; logo horizontal: `MyPayTracker_ control financiero claro y sereno.png`.
