import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../toast/ToastProvider'
import { OptionsView } from './OptionsView'

vi.mock('../../data/auth', () => ({ changePassword: vi.fn(), endExpiredSession: vi.fn() }))

afterEach(() => { vi.unstubAllGlobals() })

function render() {
  // Sin jsdom: lo mínimo que lee ThemeToggle.
  vi.stubGlobal('document', { documentElement: { dataset: { theme: 'light' } } })
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  return renderToStaticMarkup(<ToastProvider><OptionsView email="yo@correo.com" onSignOut={() => {}} /></ToastProvider>)
}

describe('NAV-02jm: Opciones', () => {
  it('AC-2: reúne tema, cambiar contraseña, correo y cerrar sesión', () => {
    const html = render()
    expect(html).toContain('Tema oscuro')
    expect(html).toContain('Cambiar contraseña')
    expect(html).toContain('yo@correo.com')
    expect(html).toContain('Cerrar sesión')
  })
  it('AC-4: el primer h2 es enfocable por código', () => {
    expect(render().match(/<h2[^>]*>/)?.[0]).toContain('tabindex="-1"')
  })
})
