# OAUTH-01jm — Token de Gmail que no caduca

## Problema
La app OAuth de Google está en modo "Prueba": el refresh token de Gmail caduca cada 7 días y el cron deja de leer correos (`invalid_grant`).

## Objetivo
Publicar la app OAuth en "En producción" para que el token no caduque a los 7 días.

## Requisitos de usuario
- No tener que renovar el token cada semana.
- Google exige página principal y política de privacidad públicas para publicar.

## Criterios de aceptación
- AC-1: existe una página pública de política de privacidad que dice qué lee la app (solo correos BAC), para qué y que no comparte datos.
- AC-2: la app está desplegada en una URL pública y la página principal carga el login.
- AC-3: la política de privacidad está en `<url>/privacy.html`.
- AC-4: la pantalla de branding de Google tiene ambas URLs y la app queda "En producción" (paso manual del usuario).
- AC-5: un refresh token nuevo, emitido en producción, está en los secrets y el sync responde sin error (paso manual del usuario).

## Restricciones
- No enviar la app a verificación de Google (auditoría de pago); uso personal sin verificar.
- Ningún secreto en el repo ni en el deploy, salvo la publishable key (pública por diseño, RLS protege).

## Fuera de alcance
Dominio propio, Apps Script, despliegue automático desde GitHub.

## Supuestos
- Deploy con Vercel CLI desde la máquina del usuario (pedido explícito).
- El login de Supabase es por contraseña; no depende de redirect URLs.
