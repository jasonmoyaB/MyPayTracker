import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginView } from './LoginView'

vi.mock('../../data/auth', () => ({ signIn: vi.fn() }))
afterEach(() => { vi.unstubAllGlobals() })

describe('AC-4: favicon e iconos en index.html', () => {
  const html = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8')
  it('declara favicon, apple-touch-icon y theme-color', () => {
    expect(html).toContain('<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />')
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />')
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}"/)
  })
})

describe('AC-6: el login muestra el logo horizontal', () => {
  it('con texto alternativo y tamaño contenido', () => {
    vi.stubGlobal('document', { documentElement: { dataset: {} } })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const markup = renderToStaticMarkup(<LoginView />)
    expect(markup).toMatch(/<img src="\/icons\/logo.png" alt="MyPayTracker" width="640" height="213"/)
  })
})

describe('UX-03jm-T03: el login no muestra el botón de tema', () => {
  it('el tema se cambia en Opciones', () => {
    expect(renderToStaticMarkup(<LoginView />)).not.toMatch(/Tema (claro|oscuro)/)
  })
})
