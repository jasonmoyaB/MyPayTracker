# PWA-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta. Depende de UX-01jm (iconos), UX-02jm (toasts) y DASH-01jm (Cuenta).

## Tareas
- [x] PWA-01jm-T01 Manifest + service worker (push, clic) + registro [public/manifest.webmanifest, public/sw.js, index.html, src/ui/main.tsx] (AC-1, AC-7)
  - Evidencia: rojo pwa.test.ts "ENOENT manifest.webmanifest"; verde 6 pruebas (manifest, index.html, registro, sw.js ejecutado con `self` falso: push, clic con ventana y sin ella); iconos solo `any` (el logo llega al borde y `maskable` lo recortaría); typecheck, test y build OK.
- [ ] PWA-01jm-T02 Migración `push_subscriptions` con RLS por dueño (sin aplicar) [supabase/migrations/0006_push_subscriptions.sql] (AC-8)
- [ ] PWA-01jm-T03 Prueba + `movementNotification` [src/domain/notification.ts, src/domain/notification.test.ts] (AC-5)
- [ ] PWA-01jm-T04 `saveSubscription`/`deleteSubscription` [src/data/push.ts] (AC-2, AC-4) (depende de T02)
- [ ] PWA-01jm-T05 Prueba + `PushToggle` con estados y aviso iPhone; montarlo en Cuenta [src/ui/account/PushToggle.tsx, src/ui/account/PushToggle.test.tsx, src/ui/account/AccountView.tsx] (AC-2–AC-4) (depende de T04)
- [ ] PWA-01jm-T06 Envío push solo de filas nuevas + limpieza 404/410 [supabase/functions/sync-bac-emails/index.ts, supabase/functions/sync-bac-emails/push.ts] (AC-5, AC-6, AC-9) (depende de T02, T03)
- [ ] PWA-01jm-T07 Guía de pasos manuales (VAPID, secrets, Vercel, db push, deploy) [docs/specs/PWA-01jm-push/despliegue.md]
