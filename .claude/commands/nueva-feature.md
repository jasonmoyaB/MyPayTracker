---
description: Feature nueva sin human in the loop. Codex investiga; si es grande planner → coder → reviwer, si es chica directo.
argument-hint: [TICKET] contexto; solución
---
Pedido: $ARGUMENTS

Trabaja de punta a punta sin pedirme confirmación.

Antes de empezar, activa el plugin ponytail (skill `ponytail:ponytail`, nivel full) y mantenlo
todo el flujo: reutiliza lo que ya existe, nada de abstracciones ni dependencias no pedidas,
diff más corto que funcione. Pásale la misma regla a los agentes que lances (coder incluido).

0. Si el pedido no trae número de ticket, invéntalo así para no chocar con otros devs:
   - Prefijo del módulo (BOL, BIT, CAT, MCP, NAV, PROV, UX…, o uno nuevo de 2–4 letras).
   - Número: el siguiente libre de ese prefijo mirando TODAS las ramas, no solo la local:
     `git fetch --all --prune`, luego
     `for b in $(git branch -a --format='%(refname:short)'); do git ls-tree -d --name-only "$b" docs/specs/; done | sort -u`.
     Cuenta también carpetas sin commitear de docs/specs/.
   - Sufijo con las iniciales del dev (de `git config user.name`, minúsculas, 2–3 letras), para
     que dos devs que inventen a la vez nunca generen el mismo ID: p. ej. `BOL-06jm`.
   - Carpeta: docs/specs/BOL-06jm-<nombre>/; tareas: BOL-06jm-T01…
   - Si aun así la carpeta existe, sube el número. Menciona el ticket elegido en el resumen final.

1. Usa la skill orchestration: lanza un worker Codex SOLO LECTURA que investigue el pedido y
   devuelva un reporte de máx 40 líneas con rutas reales: qué existe hoy, tablas/RLS/RPC,
   pantallas y queries reutilizables, qué falta crear, riesgos con invariantes de CLAUDE.md.
   Libera el worker al terminar.
2. Con el reporte clasifica el tamaño (criterio de .claude/agents/planner.md → Cuándo se usa):
   - GRANDE (varias capas o módulos, regla de negocio nueva, o 4+ tareas): actúa como @planner.
   - CHICA (lo demás): sin agentes; trabaja directo siguiendo el flujo de spec de CLAUDE.md.
   En ambos casos NO me preguntes: decide lo que falte con el criterio más conservador y
   consistente con docs/mapa-de-la-app.md, y anótalo en una sección "Supuestos" de spec.md.
   Escribe spec.md → plan.md → task.md en docs/specs/<TICKET>-<nombre>/.
3. GRANDE: sigue directo con coder (Opus) → reviwer (Sonnet; Opus si la tarea toca migración,
   RLS o bodega) hasta que no queden hallazgos bloqueantes.
   CHICA: implementa tú las tareas con TDD, un commit por tarea, y corre pnpm typecheck y tests.
4. Detente y pregúntame SOLO si el pedido obliga a romper una invariante de CLAUDE.md
   (inmutabilidad de aplicaciones, multi-tenant/RLS, reglas de stock) o a borrar datos.
5. Nunca push, db push ni cambios en Supabase remoto. Al final: resumen con supuestos tomados
   y tabla por tarea (commit, review, estado).
