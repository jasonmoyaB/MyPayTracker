# PWA-01jm — Pasos manuales de despliegue

Nada de esto se hizo en el repo: las claves no se guardan en git y los cambios remotos los hace el dueño.
Ejecutar desde la raíz del proyecto, en este orden.

## 1. Generar las claves VAPID (una sola vez)
```sh
npx web-push@3.6.7 generate-vapid-keys
```
Copia `Public Key` y `Private Key`. La privada no se pega en ningún archivo ni chat.

## 2. Secrets de la Edge Function (Supabase)
```sh
npx supabase@2.48.3 secrets set VAPID_PUBLIC_KEY=<public> VAPID_PRIVATE_KEY=<private> VAPID_SUBJECT=mailto:<tu-correo>
```
Sin estos tres secrets la función sigue sincronizando y solo registra un aviso (`Faltan secrets VAPID`).

## 3. Clave pública en Vercel (Production)
```sh
npx vercel@65.5.0 env add VITE_VAPID_PUBLIC_KEY production
```
Pega la **pública** (la misma del paso 2). Para probar en local, añádela también a `.env`.
Sin ella, Cuenta muestra "Notificaciones no configuradas" y nada se rompe.

## 4. Migración `0006_push_subscriptions`
```sh
npx supabase@2.48.3 db push
```

## 5. Desplegar la función y la web
```sh
npx supabase@2.48.3 functions deploy sync-bac-emails --use-api
npx vercel@65.5.0 deploy --prod
```
El deploy de Vercel va después del paso 3: `VITE_*` se incrusta al compilar.

## 6. Probar
1. Android/escritorio: abre la URL de producción en Chrome → menú → "Instalar app".
   iPhone (iOS 16.4+): Safari → Compartir → "Agregar a inicio" y abre la app desde el icono.
2. En la app: Cuenta → Notificaciones → "Activar notificaciones" → aceptar el permiso.
   Debe decir "Notificaciones activas en este dispositivo." y aparecer una fila en `push_subscriptions`.
3. Espera un correo BAC nuevo (o envíate uno reenviado por el banco) y el cron de 5 min:
   llega "Ingreso"/"Gasto" con monto y descripción. Tocarla abre la app en Movimientos.
4. La siguiente corrida del cron no repite la notificación (el correo ya está guardado).
5. "Desactivar" borra la fila de ese dispositivo; los siguientes correos ya no lo notifican.
6. Logs: Supabase → Edge Functions → `sync-bac-emails` → Logs (errores de push salen como
   `Notificaciones push fallaron` o `Push a una suscripción falló`; no cortan el sync).

## Verificación local de la función
```sh
npx deno@2.1.4 check --no-lock --node-modules-dir=none supabase/functions/sync-bac-emails/index.ts
```
`--node-modules-dir=none` hace falta porque `web-push` no está (ni debe estar) en `package.json`.
