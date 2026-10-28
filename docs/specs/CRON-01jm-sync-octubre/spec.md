# CRON-01jm — Sincronización automática (octubre)

## Problema
Los correos de BAC solo se leían cuando alguien llamaba la sincronización a mano, y cualquiera con la clave pública podía dispararla.

## Objetivo
Que la app lea sola, cada hora, los correos BAC de octubre 2026, y que nadie más pueda dispararla.

## Requisitos de usuario
- Ver los movimientos de octubre sin hacer nada a mano.
- No tener que compartir ninguna clave nueva para que funcione.

## Criterios de aceptación
- AC-1: cada hora en punto se leen los correos BAC de octubre 2026, aunque sean más de 100.
- AC-2: correos ya guardados no se duplican.
- AC-3: una llamada sin la clave secreta de la sincronización se rechaza y no lee el correo.
- AC-4: esa clave secreta nunca aparece en el repositorio, en la configuración visible ni en el chat.

## Restricciones
- Solo octubre 2026, literal: desde noviembre no entran correos nuevos hasta cambiar el rango.

## Fuera de alcance
Elegir el rango desde la pantalla, aviso cuando caduque el acceso a Gmail.
