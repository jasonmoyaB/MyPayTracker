# MCP-01jm — Plan

## Arquitectura
Cliente MCP (Claude/ChatGPT) → Edge Function `mcp` (Streamable HTTP, JSON-RPC sin estado) →
PostgREST con el JWT del usuario (RLS). La autorización la hace Supabase Auth como servidor
OAuth 2.1; la app solo aporta la pantalla de consentimiento.

## Módulos
1. **domain (`src/domain/monthStats.ts`)**
   - `parseMonth("YYYY-MM")` → fecha dentro de ese mes en CR, o `null` si es inválido. Se pasa a
     `monthStats` / `topExpenses`, que ya calculan el mes por `now`: cero lógica duplicada.
   - Imports con extensión `.ts` (como `summary.ts`) para que Deno lo cargue.
2. **Edge Function `supabase/functions/mcp/`**
   - `tools.ts`: definición de las 2 herramientas (JSON Schema a mano, sin SDK ni zod) y
     `handleRpc(body, query)` puro: `initialize`, `ping`, `tools/list`, `tools/call`, notificaciones
     → 202. `query` se inyecta para testear sin red. Errores de argumento → `isError: true` (AC-5).
   - `index.ts`: solo I/O. Lee `Authorization: Bearer`, valida con `auth.getUser(token)`; si falla,
     401 + `WWW-Authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource"`
     (AC-1). Sirve ese metadata (resource + `authorization_servers: [SUPABASE_URL/auth/v1]`).
     Crea un cliente por request con `SUPABASE_ANON_KEY` + el JWT del usuario: RLS filtra (nunca
     `service_role`). Rango de fechas filtrado en la query (`occurred_at` gte/lt), límite 200.
   - Se despliega con `--no-verify-jwt`: el 401 con `WWW-Authenticate` lo da la función, no el gateway.
3. **data (`src/data/oauth.ts`)**: `getAuthorization(id)`, `approve(id)`, `deny(id)` sobre
   `supabase.auth.oauth.*`. Requiere subir `@supabase/supabase-js` (2.50 no trae `auth.oauth`);
   es una dependencia ya existente, no una nueva.
4. **ui (`src/ui/auth/ConsentView.tsx`)**: si la URL trae `authorization_id`, `App` muestra login
   (si falta sesión) y luego `ConsentView`: nombre del cliente, "solo lectura", Aprobar/Rechazar →
   `location.href = redirect_url`. Si ya consintió antes, redirige directo.
5. **Vercel**: `vercel.json` con rewrite de `/oauth/consent` a `/index.html` (hoy no hay fallback SPA).
6. **docs**: `despliegue.md` con los pasos manuales: activar OAuth Server + registro dinámico,
   Authorization Path `/oauth/consent`, desplegar función y web, agregar conector en Claude/ChatGPT.

## Decisiones
- Sin `@modelcontextprotocol/sdk`: el subconjunto sin estado son ~4 métodos JSON-RPC.
- Salida de montos como texto decimal (`centsToNumeric`) + moneda: el LLM no hace aritmética con floats.
- Moneda: `resumen_mes` solo CRC (reutiliza el Resumen); `movimientos` trae ambas, etiquetadas.
- Sin migración: el esquema y RLS actuales bastan.

## Riesgos
- Registro dinámico abierto: cualquiera registra un cliente, pero sin login + consentimiento no lee nada.
- La función tiene `verify_jwt` apagado: toda ruta salvo el metadata exige token válido.
