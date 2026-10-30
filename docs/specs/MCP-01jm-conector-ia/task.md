# MCP-01jm — Tareas

- [x] MCP-01jm-T01 (domain) `parseMonth` en `monthStats.ts` con test (válido, mes 13, texto basura, borde CR) e imports `.ts`.
- [x] MCP-01jm-T02 (functions) `mcp/tools.ts`: `handleRpc` con `initialize`, `ping`, `tools/list`, `tools/call` (`resumen_mes`, `movimientos`) y test con `query` simulado (AC-2, AC-3, AC-5).
- [x] MCP-01jm-T03 (functions) `mcp/index.ts`: Bearer + `getUser`, 401 con `WWW-Authenticate`, metadata, cliente con JWT del usuario; test de fuente (sin `SERVICE_ROLE`, 401) y `deno check` (AC-1).
- [x] MCP-01jm-T04 (data) subir `@supabase/supabase-js` y `src/data/oauth.ts` (get/approve/deny) con test con el cliente simulado.
- [x] MCP-01jm-T05 (ui) `ConsentView` + desvío en `App` cuando hay `authorization_id`, y `vercel.json` con rewrite; test de la vista (AC-4).
- [x] MCP-01jm-T06 (docs) `despliegue.md` con los pasos manuales (OAuth Server, deploy `--no-verify-jwt`, conectar Claude/ChatGPT).
