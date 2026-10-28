# OAUTH-01jm — Plan

## Base
spec.md de esta carpeta. Sin código nuevo de dominio ni datos.

## Módulos

### 1. Política de privacidad (estática)
- `public/privacy.html`: HTML estático; Vite copia `public/` tal cual al build.
- Contenido: qué datos (correos de remitentes BAC, solo lectura), para qué (calcular saldo propio),
  dónde se guardan (Supabase del dueño), que no se comparten ni venden, contacto (correo del dueño),
  cómo revocar (myaccount.google.com/permissions).
- Sin JS ni dependencias; usa los mismos colores base que `theme.css` copiados inline.

### 2. Deploy en Vercel
- Vercel CLI (`npx vercel@<versión fija>`), login interactivo del usuario.
- Framework Vite: build `pnpm build`, salida `dist/`. Vercel lo detecta solo; sin `vercel.json`.
- Variables de entorno de producción: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
  Se inyectan en build (Vite las incrusta); ambas son públicas.
- `.vercel/` (vínculo local del proyecto) va en `.gitignore`.
- App de una sola página, sin rutas: no hace falta rewrite SPA.

### 3. Google y token (manual, usuario)
- Branding: página principal = URL de Vercel, privacidad = `/privacy.html`, dominio autorizado = dominio de Vercel.
- Público → Publicar app.
- OAuth Playground con credenciales propias → refresh token nuevo → `supabase secrets set GMAIL_REFRESH_TOKEN`.
- Verificación: invocar el sync y ver `scanned/parsed/inserted` sin error.

## Riesgos
- Google podría pedir verificar el dominio en Search Console: se resuelve con meta tag en `index.html` si lo pide.
- El token viejo (emitido en Prueba) sigue caducando: hay que sacar uno nuevo sí o sí.
- Sin uso 6 meses el token muere igual; el cron horario lo evita.
