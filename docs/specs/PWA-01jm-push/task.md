# PWA-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-01jm (iconos), UX-02jm (toasts) y DASH-01jm (Cuenta).

## Tareas
- [x] PWA-01jm-T01 Manifest + service worker (push, clic) + registro [public/manifest.webmanifest, public/sw.js, index.html, src/ui/main.tsx] (AC-1, AC-7)
  - Evidencia: rojo pwa.test.ts "ENOENT manifest.webmanifest"; verde 6 pruebas (manifest, index.html, registro, sw.js ejecutado con `self` falso: push, clic con ventana y sin ella); iconos solo `any` (el logo llega al borde y `maskable` lo recortaría); typecheck, test y build OK.
- [x] PWA-01jm-T02 Migración `push_subscriptions` con RLS por dueño (sin aplicar) [supabase/migrations/0006_push_subscriptions.sql] (AC-8)
  - Evidencia: rojo push.test.ts "ENOENT 0006_push_subscriptions.sql"; verde 2 pruebas (columnas, RLS select/insert/delete, sin update: el cliente usa on conflict do nothing); sin aplicar; typecheck, test y build OK.
- [x] PWA-01jm-T03 Prueba + `movementNotification` [src/domain/notification.ts, src/domain/notification.test.ts] (AC-5)
  - Evidencia: rojo "Cannot find module ./notification"; verde 4 pruebas (gasto CRC, ingreso USD, recorte a 60, sin descripción); import type con `.ts` para Deno; typecheck, test y build OK.
- [x] PWA-01jm-T04 `saveSubscription`/`deleteSubscription` [src/data/push.ts] (AC-2, AC-4) (depende de T02)
  - Evidencia: rojo "Cannot find module ./push"; verde 4 pruebas nuevas en push.test.ts (upsert ignoreDuplicates por endpoint, rechaza sin claves, borra por endpoint, propaga error); typecheck, test y build OK.
- [x] PWA-01jm-T05 Prueba + `PushToggle` con estados y aviso iPhone; montarlo en Cuenta [src/ui/account/PushToggle.tsx, src/ui/account/PushToggle.test.tsx, src/ui/account/AccountView.tsx] (AC-2–AC-4) (depende de T04)
  - Evidencia: rojo "Cannot find module ./pushState"; verde 15 pruebas en PushToggle.test.tsx (base64url, 8 estados, textos, activar/denegado/rollback, desactivar/fallo); lógica pura en `pushState.ts` (archivo extra); Cuenta monta `PushToggle` en lugar del hueco `children`; typecheck, test y build OK.
- [x] PWA-01jm-T06 Envío push solo de filas nuevas + limpieza 404/410 [supabase/functions/sync-bac-emails/index.ts, supabase/functions/sync-bac-emails/push.ts] (AC-5, AC-6, AC-9) (depende de T02, T03)
  - Evidencia: rojo push.test.ts "Cannot find module ./push.ts"; verde 5 pruebas (envío por suscripción, sin filas nuevas no envía, sin VAPID omite, 404/410 se borra, otros errores no rompen); `deno check --no-lock --node-modules-dir=none` OK (sin el flag Deno busca web-push en node_modules por el package.json raíz); typecheck, test y build OK.
- [x] PWA-01jm-T07 Guía de pasos manuales (VAPID, secrets, Vercel, db push, deploy) [docs/specs/PWA-01jm-push/despliegue.md]
  - Evidencia: guía con VAPID, secrets, env de Vercel, db push, deploy de función y web, pruebas y check de Deno (solo docs, sin prueba automática); typecheck, test y build OK.

## Correcciones de revisión
- [x] PWA-01jm-T08 Re-guardar la suscripción existente al abrir Cuenta; permiso pedido antes de cualquier await (iOS); `sw.js` tolera payload no JSON; logs de push sin endpoint ni cuerpo [src/ui/account/PushToggle.tsx, public/sw.js, supabase/functions/sync-bac-emails/push.ts]
  - Evidencia: 247 tests, typecheck, build y deno check OK
