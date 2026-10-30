import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Importar index.ts arrancaría Deno.serve: se revisa el código fuente.
const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8')
const finalCatch = source.slice(source.lastIndexOf('} catch'))

describe('MCP-01jm-T03: el conector lee como el usuario', () => {
  it('nunca usa la service_role: RLS filtra con el JWT del usuario', () => {
    expect(source).not.toMatch(/SERVICE_ROLE/)
    expect(source).toMatch(/SUPABASE_ANON_KEY/)
    expect(source).toMatch(/auth\.getUser\(token\)/)
  })
  it('AC-1: sin token válido responde 401 indicando dónde autenticarse', () => {
    expect(source).toMatch(/status: 401/)
    expect(source).toMatch(/'WWW-Authenticate': `Bearer resource_metadata="\$\{METADATA\}"`/)
    expect(source).toMatch(/oauth-protected-resource/)
  })
  it('MCP-01jm-T07: Bearer sin distinguir mayúsculas y 401 sin token antes de crear el cliente', () => {
    expect(source).toMatch(/\/\^Bearer \(\.\+\)\$\/i/)
    expect(source.indexOf('if (!token)')).toBeGreaterThan(-1)
    expect(source.indexOf('if (!token)')).toBeLessThan(source.indexOf('createClient('))
  })
  it('MCP-01jm-T07: un body que no es objeto es -32600 con 400', () => {
    expect(source).toMatch(/code: -32600/)
  })
  it('los errores internos solo van al log y la respuesta es genérica', () => {
    expect(finalCatch).toMatch(/console\.error\(/)
    expect(finalCatch).toMatch(/status: 500/)
    expect(finalCatch).not.toMatch(/\.message/)
  })
})

describe('MCP-03jm-T01: escritura como el usuario del token', () => {
  it('el user_id del upsert sale de auth.user.id, no de los argumentos', () => {
    expect(source).toMatch(/const userId = auth\.user\.id/)
    expect(source).toMatch(/upsert\(\{ user_id: userId, \.\.\.fields/)
  })
})
