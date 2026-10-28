import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginView } from './LoginView'
import { PasswordField } from './PasswordInput'

vi.mock('../../data/auth', () => ({ signIn: vi.fn() }))
afterEach(() => { vi.unstubAllGlobals() })

const render = (visible: boolean) => renderToStaticMarkup(
  <PasswordField id="pw" label="Contraseña" name="password" autoComplete="current-password" required
    visible={visible} onToggle={() => {}} />,
)

describe('AC-1: botón de ojo en la contraseña', () => {
  it('oculta por defecto y ofrece "Mostrar contraseña"', () => {
    const markup = render(false)
    expect(markup).toMatch(/<input[^>]*type="password"/)
    expect(markup).toMatch(/<button type="button"[^>]*aria-label="Mostrar contraseña"[^>]*aria-pressed="false"/)
  })

  it('visible muestra el texto y ofrece "Ocultar contraseña"', () => {
    const markup = render(true)
    expect(markup).toMatch(/<input[^>]*type="text"/)
    expect(markup).toMatch(/aria-label="Ocultar contraseña"[^>]*aria-pressed="true"/)
  })

  it('pasa las props del input, se alcanza con teclado y el icono es decorativo', () => {
    const markup = render(false)
    expect(markup).toContain('<label for="pw">Contraseña</label>')
    const input = markup.match(/<input[^>]*>/)?.[0] ?? ''
    for (const attr of ['id="pw"', 'name="password"', 'autoComplete="current-password"', 'required']) expect(input).toContain(attr)
    expect(markup).not.toContain('tabindex')
    expect(markup).toMatch(/<svg[^>]*aria-hidden="true"/)
  })

  it('el login usa el campo con ojo', () => {
    vi.stubGlobal('document', { documentElement: { dataset: {} } })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const markup = renderToStaticMarkup(<LoginView />)
    expect(markup).toMatch(/<input[^>]*id="login-password"[^>]*type="password"/)
    expect(markup).toContain('aria-label="Mostrar contraseña"')
  })
})
