import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Importar index.ts arrancaría Deno.serve: se revisa el código fuente del catch final.
const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8')
const finalCatch = source.slice(source.lastIndexOf('} catch'))

describe('AC-7: la sincronización no filtra detalles internos', () => {
  it('registra el detalle solo en el log', () => {
    expect(finalCatch).toMatch(/console\.error\(/)
  })
  it('responde 500 con un código genérico, sin el mensaje del error', () => {
    expect(finalCatch).toMatch(/Response\.json\(\{ error: 'sync_failed' \}, \{ status: 500 \}\)/)
    expect(finalCatch).not.toMatch(/Response\.json\([^)]*\.message/)
  })
})

describe('ARQ-02jm-T03: lee todos los email_message_id guardados', () => {
  it('pagina con allPages y orden estable', () => {
    expect(source).toMatch(/from '\.\.\/\.\.\/\.\.\/src\/domain\/paging\.ts'/)
    expect(source).toMatch(/allPages\(async \(from, to\)/)
    expect(source).toMatch(/\.order\('id'\)\s*\.range\(from, to\)/)
  })
})
