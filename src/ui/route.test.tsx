import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseRoute } from './route'
import { AppShell } from './AppShell'

describe('AC-1: parseRoute', () => {
  it.each([
    ['#/resumen', 'resumen'], ['#/movimientos', 'movimientos'], ['#/cuenta', 'cuenta'],
    ['', 'resumen'], ['#', 'resumen'], ['#/otra', 'resumen'], ['#/cuenta/extra', 'resumen'],
  ])('%s → %s', (hash, route) => expect(parseRoute(hash)).toBe(route))
})

describe('AC-1: AppShell', () => {
  const html = renderToStaticMarkup(<AppShell route="movimientos" header={<h1>App</h1>}><p>contenido</p></AppShell>)

  it('nav con nombre accesible y los tres enlaces por hash', () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Secciones"/)
    for (const href of ['#/resumen', '#/movimientos', '#/cuenta']) expect(html).toContain(`href="${href}"`)
    for (const text of ['Resumen', 'Movimientos', 'Cuenta']) expect(html).toContain(`>${text}</a>`)
  })
  it('solo la sección activa lleva aria-current="page"', () => {
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a[^>]*href="#\/movimientos"[^>]*aria-current="page"/)
  })
  it('muestra encabezado y contenido', () => {
    expect(html).toContain('<h1>App</h1>')
    expect(html).toContain('<p>contenido</p>')
  })
})
