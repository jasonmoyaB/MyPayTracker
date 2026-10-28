import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

// Sin jsdom: se simula solo lo que el botón lee del navegador.
function browser(dataTheme: string | undefined, prefersDark: boolean) {
  vi.stubGlobal('document', { documentElement: { dataset: dataTheme ? { theme: dataTheme } : {} } })
  vi.stubGlobal('matchMedia', () => ({ matches: prefersDark }))
}

afterEach(() => { vi.unstubAllGlobals() })

describe('AC-3: el botón nombra el tema destino', () => {
  it('en tema claro ofrece el oscuro', () => {
    browser('light', true)
    const html = renderToStaticMarkup(<ThemeToggle />)
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Tema oscuro')
  })
  it('en tema oscuro ofrece el claro', () => {
    browser('dark', false)
    expect(renderToStaticMarkup(<ThemeToggle />)).toContain('Tema claro')
  })
  it('sin elección guardada sigue al sistema', () => {
    browser(undefined, true)
    expect(renderToStaticMarkup(<ThemeToggle />)).toContain('Tema claro')
  })
})
