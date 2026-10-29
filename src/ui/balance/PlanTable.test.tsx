import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { comparePlans } from '../../domain/recommend'
import { formatMoney } from '../format'
import { PlanTable } from './PlanTable'

describe('TC-03jm AC-1: tabla de cuota por plazo', () => {
  const rows = comparePlans({ priceCents: 20_000_000, balanceCents: 15_000_000, extraCents: 0, salaryCents: 15_000_000,
    scheduleCrc: {}, now: new Date('2026-11-10T12:00:00-06:00') })
  const html = renderToStaticMarkup(<PlanTable rows={rows} />)
  it('tabla accesible con caption y encabezados', () => {
    expect(html).toContain('<caption>Cuota por plazo</caption>')
    for (const th of ['Plazo', 'Cuota al mes', 'Primer pago', 'Recomendación']) expect(html).toContain(`<th scope="col">${th}</th>`)
  })
  it('una fila por plazo con su cuota y veredicto', () => {
    expect(html.match(/<tr>/g)).toHaveLength(6)
    expect(html).toContain(formatMoney(6_666_668, 'CRC'))
    expect(html).toMatch(/Tasa cero 3 meses.*Ajustado/)
    expect(html).toMatch(/Tasa cero 12 meses.*16.*Sí/)
    expect(html).toMatch(/Un solo pago.*No/)
  })
})
