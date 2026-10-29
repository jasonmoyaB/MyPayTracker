import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8')

// UX-04jm-T03: la cuadrícula del Resumen no deja huecos en escritorio.
const span = (name: string) => Number(css.match(new RegExp(String.raw`\.${name} \{ grid-column: span (\d+); \}`))?.[1])

describe('AC-2: bento sin huecos', () => {
  it('usa 6 columnas con grid-auto-flow: dense', () => {
    expect(css).toContain('grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-flow: dense;')
  })
  it('cada fila suma 6 columnas, en el orden en que se pintan las tarjetas', () => {
    const rows = [['dashboard-balance', 'dashboard-credit'], ['dashboard-month-card', 'dashboard-top'], ['dashboard-recent', 'dashboard-afford']]
    for (const row of rows) expect(row.reduce((sum, name) => sum + span(name), 0)).toBe(6)
  })
  it('sin «¿Puedo comprar esto?», los movimientos recientes ocupan la fila entera', () => {
    expect(css).toContain('.dashboard-recent:last-child { grid-column: 1 / -1; }')
  })
})
