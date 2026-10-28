import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ErrorBoundary, ErrorScreen } from './ErrorBoundary'

describe('AC-5: pantalla de recuperación', () => {
  it('un error de render activa el modo de recuperación', () => {
    expect(ErrorBoundary.getDerivedStateFromError()).toEqual({ failed: true })
  })
  it('sin error muestra los hijos', () => {
    expect(renderToStaticMarkup(<ErrorBoundary><p>app</p></ErrorBoundary>)).toBe('<p>app</p>')
  })
  it('la pantalla dice qué pasó y ofrece Recargar', () => {
    const html = renderToStaticMarkup(<ErrorScreen title="Algo salió mal" detail="Recarga la página." />)
    expect(html).toContain('role="alert"')
    expect(html).toContain('Algo salió mal')
    expect(html).toMatch(/<button[^>]*>Recargar<\/button>/)
  })
})
