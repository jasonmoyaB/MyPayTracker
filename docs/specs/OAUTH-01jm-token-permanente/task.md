# OAUTH-01jm — Tareas

## Base acordada
spec.md + plan.md de esta carpeta.

## Tareas
- [x] OAUTH-01jm-T01 Política de privacidad estática [public/privacy.html] (AC-1, AC-3)
- [x] OAUTH-01jm-T02 `.vercel/` en `.gitignore`; `pnpm build` incluye `dist/privacy.html` (AC-3)
- [x] OAUTH-01jm-T03 Login Vercel CLI (usuario) y `vercel link` del proyecto (depende de T02)
  - CLI 65.5.0 (39.3.0 ya no puede hacer login); proyecto `mypaytracker` en `jasonmoyabs-projects`
- [x] OAUTH-01jm-T04 Env vars de producción en Vercel y `vercel deploy --prod`; login y `/privacy.html` cargan (AC-2, AC-3)
  - env vars cargadas por el usuario; https://mypaytracker-green.vercel.app y `/privacy.html` → 200
- [x] OAUTH-01jm-T05 Branding de Google + Publicar app (usuario) (AC-4)
- [x] OAUTH-01jm-T06 Refresh token nuevo en secrets y sync sin error (usuario) (AC-5)
  - Google responde sin `refresh_token_expires_in` (no caduca); secret actualizado
