import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ConsentCard } from './ConsentView'

vi.mock('../../data/oauth', () => ({ getAuthorization: vi.fn(), approve: vi.fn(), deny: vi.fn() }))

const card = (props: Partial<Parameters<typeof ConsentCard>[0]> = {}) => renderToStaticMarkup(
  <ConsentCard clientName="Claude" pending={false} error={null} onApprove={() => {}} onDeny={() => {}} {...props} />,
)

describe('AC-4: pantalla de consentimiento', () => {
  it('muestra quién pide acceso, que es solo lectura, y Aprobar/Rechazar', () => {
    const html = card()
    expect(html).toContain('<strong>Claude</strong> quiere leer tus movimientos (solo lectura)')
    expect(html).toMatch(/<button[^>]*>Aprobar<\/button>/)
    expect(html).toMatch(/<button[^>]*>Rechazar<\/button>/)
  })
  it('mientras carga no se puede decidir', () => {
    expect(card({ clientName: null })).toContain('Cargando…')
    expect(card({ clientName: null })).not.toContain('Aprobar')
    expect(card({ pending: true }).match(/disabled=""/g)).toHaveLength(2)
  })
  it('los errores se anuncian con role=alert', () => {
    expect(card({ error: 'Algo salió mal.' })).toContain('<p role="alert" class="status-danger">Algo salió mal.</p>')
  })
})

describe('MCP-01jm-T05: Vercel sirve la SPA en /oauth/consent', () => {
  it('vercel.json reescribe la ruta a index.html', () => {
    const config = JSON.parse(readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'))
    expect(config.rewrites).toContainEqual({ source: '/oauth/consent', destination: '/index.html' })
  })
})
