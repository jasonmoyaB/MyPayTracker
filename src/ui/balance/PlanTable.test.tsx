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
    expect(html).toContain('<caption>Cuota por plazo (tasa cero)</caption>')
    // UX-06jm AC-1/AC-2: textos cortos y clase que da separación y nowrap en el móvil.
    expect(html).toContain('<table class="plan-table amount">')
    for (const th of ['Plazo', 'Cuota al mes', 'Primer pago', '¿Alcanza?']) expect(html).toContain(`<th scope="col">${th}</th>`)
  })
  it('una fila por plazo con su cuota y veredicto', () => {
    expect(html.match(/<tr>/g)).toHaveLength(6)
    expect(html).toContain(formatMoney(6_666_668, 'CRC'))
    expect(html).toMatch(/<td>3 meses<\/td>.*Ajustado/)
    expect(html).toMatch(/<td>12 meses<\/td>.*16.*Sí/)
    expect(html).toMatch(/<td>Un pago<\/td>.*No/)
    // UX-06jm-T02: el color va en una etiqueta dentro de la celda, no en la celda entera.
    expect(html).toContain('<td><span class="status-success">Sí</span></td>')
  })
})

describe('SIM-01jm: tabla de libre por mes', () => {
  const html = renderToStaticMarkup(<MonthTable rows={[
    { dueAt: '2026-10-20T06:00:00.000Z', cuotasCents: 20_000_000, freeCents: -5_000_000 },
    { dueAt: '2026-11-20T06:00:00.000Z', cuotasCents: 1_000_000, freeCents: 14_000_000 },
    { dueAt: '2026-12-20T06:00:00.000Z', cuotasCents: 1_000_000, freeCents: null },
  ]} />)
  it('tabla accesible con caption y encabezados', () => {
    expect(html).toContain('<table class="plan-table amount"><caption>Lo que te queda libre cada mes</caption>') // sin gasto promedio, sin nota
    for (const th of ['Mes', 'Cuotas', 'Libre']) expect(html).toContain(`<th scope="col">${th}</th>`)
  })
  it('AC-2: el negativo va en rojo; AC-3: sin salario, "—"', () => {
    // UX-06jm-T03: el rojo va en una etiqueta, no en toda la celda.
    expect(html).toContain(`<td><span class="status-danger">${formatMoney(-5_000_000, 'CRC')}</span></td>`)
    expect(html).toContain(`<td>${formatMoney(14_000_000, 'CRC')}</td>`)
    expect(html).toContain('<td>—</td>')
  })
  it('SIM-01jm-T03: con gasto promedio, la nota lo dice', () => {
    const rows = [{ dueAt: '2026-11-20T06:00:00.000Z', cuotasCents: 1_000_000, freeCents: 5_000_000 }]
    expect(renderToStaticMarkup(<MonthTable rows={rows} spendCents={9_000_000} />))
      .toContain(`ya resta ${formatMoney(9_000_000, 'CRC')} de gastos promedio`)
  })
  it('AC-4: sin meses no hay tabla', () => {
    expect(renderToStaticMarkup(<MonthTable rows={[]} />)).toBe('')
  })
})
