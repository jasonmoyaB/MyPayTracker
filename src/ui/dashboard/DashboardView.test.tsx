import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../data/transactions'
import { formatDate, formatMoney } from '../format'
import { DashboardView } from './DashboardView'

const now = new Date('2026-11-15T18:00:00Z')
let id = 0
const tx = (occurredAt: string, amountCents: number, direction: 'in' | 'out', description: string,
  extra: Partial<Transaction> = {}): Transaction =>
  ({ id: String(++id), occurredAt, amountCents, direction, description, currency: 'CRC', source: 'manual', paymentMethod: 'cash', ...extra })

const transactions = [
  tx('2026-11-14T10:00:00-06:00', 50_000_00, 'in', 'Salario', { source: 'email_regex' }),
  tx('2026-11-13T10:00:00-06:00', 12_000_00, 'out', 'Super'),
  tx('2026-11-12T10:00:00-06:00', 8_000_00, 'out', 'Super'),
  tx('2026-11-11T10:00:00-06:00', 15_000_00, 'out', 'Gasolina'),
  tx('2026-11-10T10:00:00-06:00', 1_000_00, 'out', 'Café'),
  tx('2026-11-09T10:00:00-06:00', 500_00, 'out', 'Parqueo'),
  tx('2026-11-08T10:00:00-06:00', 20_00, 'out', 'Amazon', { currency: 'USD' }),
  tx('2026-10-20T10:00:00-06:00', 99_000_00, 'out', 'Mes pasado'),
]
const settings = { salaryCents: 100_000_00, account: null }
const render = (props: Partial<Parameters<typeof DashboardView>[0]> = {}) =>
  renderToStaticMarkup(<DashboardView settings={settings} transactions={transactions} now={now} {...props} />)

describe('DASH-01jm: Resumen', () => {
  const html = render()

  it('AC-2: saldo en colones (regla BAL-01jm) y USD aparte', () => {
    const balance = 100_000_00 + 50_000_00 - 12_000_00 - 8_000_00 - 15_000_00 - 1_000_00 - 500_00 - 99_000_00
    expect(html).toContain(formatMoney(balance, 'CRC'))
    expect(html).toContain(formatMoney(20_00, 'USD'))
  })
  it('AC-3: ingresos, gastos y neto del mes con signo y texto', () => {
    expect(html).toContain(`+${formatMoney(50_000_00, 'CRC')}`)
    expect(html).toContain(`−${formatMoney(36_500_00, 'CRC')}`)
    expect(html).toContain(`+${formatMoney(13_500_00, 'CRC')}`)
    for (const text of ['Ingresos', 'Gastos', 'Neto']) expect(html).toContain(text)
  })
  it('AC-4: top 3 gastos del mes', () => {
    const top = html.slice(html.indexOf('Más gasto'))
    expect(top).toContain(formatMoney(20_000_00, 'CRC'))
    expect(top.indexOf('Super')).toBeLessThan(top.indexOf('Gasolina'))
    expect(top.indexOf('Gasolina')).toBeLessThan(top.indexOf('Café'))
  })
  it('AC-5: últimos 5 movimientos y "Ver todos"', () => {
    const recent = html.slice(html.indexOf('Últimos movimientos'))
    expect(recent.match(/<li/g)).toHaveLength(5)
    expect(recent).not.toContain('Amazon')
    expect(html).toMatch(/<a href="#\/movimientos">Ver todos<\/a>/)
  })
  it('AC-6: último correo leído', () => {
    expect(html).toContain(`Último correo leído: ${formatDate('2026-11-14T10:00:00-06:00')}`)
  })
  it('AC-7: ¿Puedo comprar esto?', () => {
    expect(html).toContain('¿Puedo comprar esto?')
  })
})

describe('AC-9: estados vacíos', () => {
  const html = render({ transactions: [], settings: { salaryCents: null, account: null } })
  it('cada bloque explica que no hay datos', () => {
    for (const text of ['Registra tu saldo o salario', 'Sin movimientos este mes.', 'Sin gastos este mes.',
      'Aún no hay movimientos.', 'Aún no se ha leído ningún correo.']) expect(html).toContain(text)
    expect(html).toMatch(/href="#\/cuenta"/)
    expect(html).not.toContain('¿Puedo comprar esto?')
  })
})

describe('TC-01jm AC-2/AC-3: tarjeta de crédito en el Resumen', () => {
  // Compra el 10 nov (después del corte) → se paga el 20 dic.
  const credit = [tx('2026-11-10T10:00:00-06:00', 200_000_00, 'out', 'Tele', { paymentMethod: 'credit' })]
  const salary = { salaryCents: 150_000_00, account: null }
  it('AC-2: antes del pago: saldo intacto, deuda, fechas y aviso de quiebra', () => {
    const html = render({ settings: salary, transactions: credit })
    expect(html).toContain(formatMoney(150_000_00, 'CRC'))
    expect(html).toContain(formatMoney(200_000_00, 'CRC'))
    expect(html).toContain(`Al pagar la tarjeta te faltarían ${formatMoney(50_000_00, 'CRC')}`)
    for (const day of ['Próximo corte: 6 dic', 'Próximo pago: 20 dic']) expect(html).toContain(day)
  })
  it('AC-3: desde el 20 la compra es gasto: saldo −₡50 000 y sin deuda', () => {
    const html = render({ settings: salary, transactions: credit, now: new Date('2026-12-21T12:00:00-06:00') })
    expect(html).toContain(formatMoney(-50_000_00, 'CRC'))
    expect(html).not.toContain('te faltarían')
    expect(html).not.toContain('Próximo pago')
  })
  it('con límite positivo dice cuánto se puede gastar', () => {
    const html = render({ settings: { salaryCents: 300_000_00, account: null }, transactions: credit })
    expect(html).toContain(`Puedes gastar ${formatMoney(100_000_00, 'CRC')} sin quedar en quiebra`)
  })
})
