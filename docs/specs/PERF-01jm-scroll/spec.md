# PERF-01jm — Scroll fluido con el vidrio

## Problema
Tras UX-04jm el scroll va a tirones: en un arnés con el CSS real, ~36 ms por frame (≈27 fps) y ~200 de 240 frames con tirón. El CSS anterior ya rondaba 30 ms.

## Causa (medida)
`backdrop-filter` en cada `.card`: la tarjeta de Movimientos mide miles de píxeles y el navegador re-desenfoca toda su área en cada frame. Detrás de las tarjetas solo hay un degradado suave, así que el desenfoque casi no se ve. El fondo fijo y la capa fija de grano suman repintados.

## Requisitos
- Las tarjetas conservan el aspecto de vidrio (translúcidas, borde claro, brillo) sin desenfoque.
- El desenfoque queda solo donde hay contenido que pasa por debajo: navegación y toasts.
- El fondo no se repinta en cada frame de scroll.

## Criterios de aceptación
- AC-1: en el arnés, p50 ≤ 18 ms por frame y menos de 20 frames con tirón (> 20 ms) de 240 (antes 36 ms y ~200).
- AC-2: un test falla si `.card` vuelve a usar `backdrop-filter` o si el fondo vuelve a ser fijo.
- AC-3: el contraste AA de UX-01jm/UX-04jm sigue pasando.

## Fuera de alcance
Virtualizar la lista de movimientos.
