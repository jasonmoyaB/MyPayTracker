import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { comparePlans } from '../../domain/recommend'
import { formatMoney } from '../format'
import { MonthTable, PlanTable } from './PlanTable'

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

describe('SIM-01jm: tabla de libre por mes', () => {
  const html = renderToStaticMarkup(<MonthTable rows={[
    { dueAt: '2026-10-20T06:00:00.000Z', cuotasCents: 20_000_000, freeCents: -5_000_000 },
    { dueAt: '2026-11-20T06:00:00.000Z', cuotasCents: 1_000_000, freeCents: 14_000_000 },
    { dueAt: '2026-12-20T06:00:00.000Z', cuotasCents: 1_000_000, freeCents: null },
  ]} />)
  it('tabla accesible con caption y encabezados', () => {
    expect(html).toContain('<caption>Lo que te queda libre cada mes</caption>')
    for (const th of ['Mes', 'Cuotas', 'Libre']) expect(html).toContain(`<th scope="col">${th}</th>`)
  })
  it('AC-2: el negativo va en rojo; AC-3: sin salario, "—"', () => {
    expect(html).toContain(`<td class="status-danger">${formatMoney(-5_000_000, 'CRC')}</td>`)
    expect(html).toContain(`<td>${formatMoney(14_000_000, 'CRC')}</td>`)
    expect(html).toContain('<td>—</td>')
  })
  it('AC-4: sin meses no hay tabla', () => {
    expect(renderToStaticMarkup(<MonthTable rows={[]} />)).toBe('')
  })
})
