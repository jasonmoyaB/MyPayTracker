# AUTH-02jm — Iniciar sesión al abrir la app y límite de sesión

## Problema
La sesión queda guardada para siempre: quien abra la app en el teléfono ve saldo y movimientos sin contraseña.

## Objetivo
Como en la app del BAC: pedir la contraseña cada vez que se abre la app y cerrar la sesión si queda abierta sin uso o demasiado tiempo.

## Requisitos de usuario
- Al abrir la app (o una pestaña nueva) siempre aparece el login.
- Si no toco la app un rato, se cierra la sesión.
- Aunque la use sin parar, la sesión tiene un tiempo máximo.

## Criterios de aceptación
- AC-1: cerrar la app o la pestaña y volver a abrirla muestra el login, aunque antes hubiera sesión. Recargar la misma pestaña no la cierra.
- AC-2: la sesión guardada antes de este cambio deja de servir y se borra del dispositivo.
- AC-3: tras 5 min sin tocar la app (ni teclado, ni toque, ni clic) se cierra la sesión y aparece el login con el aviso "Tu sesión se cerró por inactividad".
- AC-4: a los 30 min desde que se inició sesión se cierra aunque haya uso, con el aviso "Tu sesión expiró, vuelve a iniciar sesión".
- AC-5: si la app estuvo en segundo plano más del límite, al volver se ve el login, no los datos.
- AC-6: al vencer, la pantalla se bloquea aunque falle la red al cerrar la sesión.
- AC-7: tras vencer, el enlace de consentimiento MCP (`authorization_id`) sigue funcionando después de volver a entrar.

## Restricciones
- Sin dependencias ni tablas nuevas; capas intactas (`src/architecture.test.ts`).
- No cambia el cron, las Edge Functions, el conector MCP ni el token de Gmail (no dependen del login web).

## Fuera de alcance
Biometría o PIN, límites configurables por el usuario, límites aplicados en el servidor de Supabase (es un cambio remoto: queda como recomendación al dev).

## Supuestos
- "Abrir la app" = nueva ventana o pestaña; una recarga no cuenta (la sesión vive en `sessionStorage`).
- Límites fijos conservadores: 5 min de inactividad y 30 min de máximo, cercanos a la banca en línea.
- El máximo se cuenta desde el último inicio de sesión del usuario; cambiar la contraseña reinicia el conteo porque vuelve a autenticar.
- Las notificaciones push siguen llegando con la app cerrada; al tocarlas se pide login.
