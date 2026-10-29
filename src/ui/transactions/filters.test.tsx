import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MovementFilter } from '../../domain/movementFilter'
import { formatMoney } from '../format'
import { FilterTotals } from './FilterTotals'
import { MovementFilters } from './MovementFilters'

const now = new Date('2026-11-01T06:30:00Z')
const render = (filter: MovementFilter) =>
  renderToStaticMarkup(<MovementFilters filter={filter} now={now} onChange={() => {}} />)

describe('AC-1/AC-2: campos de filtro con etiqueta visible', () => {
  const html = render({ from: '2026-11-01', to: '2026-11-30', direction: 'out' })
  it('Desde y Hasta son fechas con su valor', () => {
    expect(html).toMatch(/<label for="filter-from">Desde<\/label><input type="date" id="filter-from"[^>]*value="2026-11-01"/)
    expect(html).toMatch(/<label for="filter-to">Hasta<\/label><input type="date" id="filter-to"[^>]*value="2026-11-30"/)
  })
  it('selector de tipo: Todos, Ingresos, Gastos', () => {
    expect(html).toContain('<label for="filter-direction">Tipo</label>')
    for (const o of ['<option value="all">Todos</option>', '<option value="in">Ingresos</option>', '<option value="out" selected="">Gastos</option>']) {
      expect(html).toContain(o)
    }
  })
})

describe('AC-3: accesos rápidos', () => {
  it('marca con aria-pressed solo el activo', () => {
    const html = render({ from: '2026-11-01', to: '2026-11-30', direction: 'all' })
    expect(html).toContain('aria-pressed="true">Este mes</button>')
    for (const label of ['Mes pasado', 'Últimos 7 días', 'Todo']) expect(html).toContain(`aria-pressed="false">${label}</button>`)
  })
  it('fechas a mano: ninguno activo', () => {
    expect(render({ from: '2026-11-02', to: null, direction: 'all' })).not.toContain('aria-pressed="true"')
  })
})

describe('AC-5: Desde posterior a Hasta', () => {
  it('muestra el error junto al campo, enlazado y marcado inválido', () => {
    const html = render({ from: '2026-11-30', to: '2026-11-01', direction: 'all' })
    expect(html).toMatch(/id="filter-from"[^>]*aria-invalid="true"[^>]*aria-describedby="filter-error"/)
    expect(html).toMatch(/<p id="filter-error" role="alert"[^>]*>La fecha &quot;Desde&quot;/)
  })
  it('sin error no hay mensaje', () => {
    expect(render({ from: null, to: null, direction: 'all' })).not.toContain('filter-error')
  })
})

describe('AC-4: totales del filtro', () => {
  const zero = { incomeCents: 0, expenseCents: 0, netCents: 0 }
  it('ingresos +, gastos −, neto con signo, con texto además del color', () => {
    const html = renderToStaticMarkup(<FilterTotals totals={{ CRC: { incomeCents: 100_000, expenseCents: 130_000, netCents: -30_000 }, USD: zero }} />)
    expect(html).toContain(`+${formatMoney(100_000, 'CRC')}`)
    expect(html).toContain(`−${formatMoney(130_000, 'CRC')}`)
    expect(html).toContain(`−${formatMoney(30_000, 'CRC')}`)
    for (const t of ['Ingresos', 'Gastos', 'Neto', 'income', 'expense']) expect(html).toContain(t)
    expect(html).not.toContain('USD')
  })
  it('USD en línea aparte solo si hay', () => {
    const html = renderToStaticMarkup(<FilterTotals totals={{ CRC: zero, USD: { incomeCents: 500, expenseCents: 0, netCents: 500 } }} />)
    expect(html).toContain(`+${formatMoney(500, 'USD')}`)
    expect(html).toContain('Dólares')
  })
})

describe('UX-03jm AC-2/AC-3: Desde y Hasta no se solapan en el teléfono', () => {
  // Vitest vacía los .css importados; se lee del disco.
  const css = readFileSync(new URL('./transactions.css', import.meta.url), 'utf8')
  it('columnas nunca más anchas que el contenedor', () => {
    expect(css).toMatch(/\.filter-fields\s*\{[^}]*minmax\(min\(100%, \d+px\), 1fr\)/)
  })
  it('el date de iOS pierde su ancho nativo', () => {
    expect(css).toMatch(/\.filter-field input\[type="date"\]\s*\{[^}]*-webkit-appearance: none[^}]*appearance: none/)
  })
})
