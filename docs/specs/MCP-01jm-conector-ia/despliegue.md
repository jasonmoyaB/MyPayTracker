# MCP-01jm — Pasos manuales de despliegue

Nada de esto se hizo en el repo: los cambios remotos los hace el dueño. No hay secrets nuevos
(la función usa `SUPABASE_URL` y `SUPABASE_ANON_KEY`, que Supabase ya inyecta) ni migración.
Ejecutar desde la raíz del proyecto, en este orden.

## 1. Activar el servidor OAuth de Supabase Auth
Supabase → Authentication → **OAuth Server**:
- Activar **OAuth Server**.
- **Authorization Path**: `/oauth/consent`.
- **Dynamic client registration**: ON (Claude y ChatGPT se registran solos).

Authentication → URL Configuration → **Site URL** = URL de producción de Vercel
(p. ej. `https://<tu-app>.vercel.app`). Supabase manda al usuario a `<Site URL>/oauth/consent`.

## 2. Desplegar la web
```sh
pnpm build
npx vercel@65.5.0 deploy --prod
```
`vercel.json` reescribe `/oauth/consent` a `index.html`; sin este deploy esa ruta da 404.

## 3. Desplegar la función
```sh
npx supabase@2.48.3 functions deploy mcp --no-verify-jwt --use-api
```
`--no-verify-jwt` es obligatorio: el 401 con `WWW-Authenticate` (que dispara el login en el
asistente) lo da la función; el gateway respondería 401 sin esa cabecera. La función igual
exige un token válido en todo salvo `/.well-known/oauth-protected-resource`.

URL del conector: `https://<ref>.supabase.co/functions/v1/mcp`

## 4. Agregar el conector
- **Claude** (claude.ai o la app de escritorio): Settings → Connectors → **Add custom connector** →
  nombre `MyPayTracker` y la URL del paso 3 → Connect.
- **ChatGPT**: Settings → Connectors (en algunos planes, Settings → Apps & Connectors → Advanced →
  **Developer mode** ON) → Create / Add → URL del paso 3, autenticación **OAuth**.

En ambos se abre la app: si no hay sesión, inicia sesión; luego aparece
"<cliente> quiere leer tus movimientos (solo lectura)" → **Aprobar**.

## 5. Probar
1. Sin token: `curl -i -X POST https://<ref>.supabase.co/functions/v1/mcp` → `401` con
   `WWW-Authenticate: Bearer resource_metadata=".../mcp/.well-known/oauth-protected-resource"`.
2. `curl https://<ref>.supabase.co/functions/v1/mcp/.well-known/oauth-protected-resource` →
   JSON con `authorization_servers: ["https://<ref>.supabase.co/auth/v1"]`.
3. En el asistente: "¿en qué he gastado más este mes?" → usa `resumen_mes`; los montos coinciden
   con el Resumen de la app (solo CRC).
4. "Muéstrame mis gastos del 1 al 15 de este mes" → usa `movimientos`, cada uno con su moneda.
5. Logs: Supabase → Edge Functions → `mcp` → Logs (`mcp falló:` con el detalle).

## Revocar el acceso
- Desde el asistente: quitar el conector (Claude: Settings → Connectors; ChatGPT: Settings → Connectors).
- Desde Supabase (corta de verdad los tokens): Authentication → OAuth Server → Clients → borrar el cliente
  (Claude/ChatGPT), o apagar **OAuth Server** para cortar todos.

## Verificación local de la función
```sh
npx deno@2.1.4 check --no-lock --node-modules-dir=none supabase/functions/mcp/index.ts
```
