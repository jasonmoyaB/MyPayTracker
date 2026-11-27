import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../data/transactions'
import { formatDate, formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { DashboardView } from './DashboardView'

const now = new Date('2026-11-15T18:00:00Z')
let id = 0
const tx = (occurredAt: string, amountCents: number, direction: 'in' | 'out', description: string,
  extra: Partial<Transaction> = {}): Transaction =>
  ({ id: String(++id), occurredAt, amountCents, direction, description, currency: 'CRC', source: 'manual', paymentMethod: 'cash', installments: 1, ...extra })

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
  renderToStaticMarkup(<ToastProvider><DashboardView settings={settings} transactions={transactions} now={now} {...props} /></ToastProvider>)

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
  // Compra el 25 oct (después del corte del 6 oct) → se paga el 20 nov, el próximo pago visto el 15 nov.
  const credit = [tx('2026-10-25T10:00:00-06:00', 200_000_00, 'out', 'Tele', { paymentMethod: 'credit' })]
  const salary = { salaryCents: 150_000_00, account: null }
  it('AC-2: antes del pago: saldo intacto, deuda, fechas y aviso de quiebra', () => {
    const html = render({ settings: salary, transactions: credit })
    expect(html).toContain(formatMoney(150_000_00, 'CRC'))
    expect(html).toContain(formatMoney(200_000_00, 'CRC'))
    expect(html).toContain(`Al pagar te faltarían ${formatMoney(50_000_00, 'CRC')}`)
    expect(html).toContain('Corte 6 dic · Pago 20 nov')
    // UX-05jm AC-1: las cifras van en recuadros como "Este mes".
    expect(html).toMatch(/<dt>Deuda total<\/dt><dd class="amount">[^<]*200/)
    expect(html).toContain('<dt>Pagas el 20 nov</dt>')
  })
  it('AC-3: desde el 20 la compra es gasto: saldo −₡50 000 y sin deuda', () => {
    const html = render({ settings: salary, transactions: credit, now: new Date('2026-11-21T12:00:00-06:00') })
    expect(html).toContain(formatMoney(-50_000_00, 'CRC'))
    expect(html).not.toContain('te faltarían')
    expect(html).not.toContain('· Pago')
  })
  it('con límite positivo dice cuánto se puede gastar', () => {
    const html = render({ settings: { salaryCents: 300_000_00, account: null }, transactions: credit })
    expect(html).toContain(`Puedes gastar ${formatMoney(100_000_00, 'CRC')}`)
  })
  it('FIJ-01jm-T03: un fijo apartado y sin pagar baja "Puedes gastar" y el saldo de ¿Puedo comprar?', () => {
    const reminders = [{ id: 'r1', description: 'Alquiler', amountCents: 60_000_00, currency: 'CRC' as const, day: 28, reserve: true }]
    const html = render({ settings: { salaryCents: 300_000_00, account: null }, transactions: credit, reminders })
    expect(html).toContain(`Puedes gastar ${formatMoney(40_000_00, 'CRC')}`)
  })
})

describe('TC-02jm: cuotas futuras contra el salario', () => {
  // Compra el 10 nov → se paga el 20 dic: no resta hoy, pero ese mes supera el salario.
  const future = [tx('2026-11-10T10:00:00-06:00', 200_000_00, 'out', 'Tele', { paymentMethod: 'credit' })]
  it('el límite de hoy no la resta y avisa que ese pago supera el salario', () => {
    const html = render({ settings: { salaryCents: 150_000_00, account: null }, transactions: future })
    expect(html).toContain(`Puedes gastar ${formatMoney(150_000_00, 'CRC')}`)
    expect(html).toContain(`El pago del 20 dic (${formatMoney(200_000_00, 'CRC')}) supera tu salario`)
  })
  it('¿Puedo comprar esto? ofrece tarjeta y tasa cero', () => {
    const html = render({ settings: { salaryCents: 150_000_00, account: null }, transactions: future })
    for (const text of ['Forma de pago', 'Efectivo o débito', 'Tarjeta, un solo pago', 'Tasa cero 12 meses', 'Plata extra'])
      expect(html).toContain(text)
  })
})

describe('TC-10jm-T04: la deuda baja solo con "Ya pagué"', () => {
  // Compra el 10 oct → vence el 20 nov. Hoy 20 nov; la marca va hasta el 20 oct.
  const credit = [tx('2026-10-10T10:00:00-06:00', 10_000_00, 'out', 'Tele', { paymentMethod: 'credit' })]
  const nov20 = new Date('2026-11-20T10:00:00-06:00')
  it('AC-1: sin marcar sigue en deuda y en "Pagas el 20 nov", y ofrece "Ya pagué"', () => {
    const html = render({ settings: { salaryCents: 5_000_00, account: null, cardPaidThrough: '2026-10-20T06:00:00.000Z' }, transactions: credit, now: nov20 })
    expect(html).toMatch(/<dt>Deuda total<\/dt><dd class="amount">[^<]*10/)
    expect(html).toMatch(/<dt>Pagas el 20 nov<\/dt><dd class="amount">[^<]*10/)
    expect(html).toContain(`Al pagar te faltarían ${formatMoney(5_000_00, 'CRC')}`)
    expect(html).toContain('>Ya pagué</button>')
  })
  it('AC-2: marcado el 20 nov pasa a gasto y sale de la deuda', () => {
    const html = render({ settings: { salaryCents: 15_000_00, account: null, cardPaidThrough: '2026-11-20T06:00:00.000Z' }, transactions: credit, now: nov20 })
    expect(html).toContain(formatMoney(5_000_00, 'CRC'))
    expect(html).not.toContain('Pagas el')
    expect(html).not.toContain('Ya pagué')
  })
  // TC-10jm-T07: solo tras el corte (6 nov) del ciclo del 20 nov; antes aún pueden entrar compras a ese pago.
  const at = (now: string) => render({ settings: { salaryCents: 5_000_00, account: null, cardPaidThrough: '2026-10-20T06:00:00.000Z' },
    transactions: credit, now: new Date(now) })
  it('T07: 2 nov (antes del corte) sin botón; 7 nov y 25 nov (atrasado) con botón', () => {
    expect(at('2026-11-02T10:00:00-06:00')).not.toContain('Ya pagué')
    expect(at('2026-11-07T10:00:00-06:00')).toContain('>Ya pagué</button>')
    expect(at('2026-11-25T10:00:00-06:00')).toContain('>Ya pagué</button>')
  })
})

describe('USD-01jm-T03: equivalente en colones de los USD', () => {
  it('con tipo guardado muestra ≈ ₡ y el tipo, sin tocar el saldo', () => {
    const html = render({ settings: { ...settings, usdRateCents: 505_32 } })
    expect(html).toContain(`≈ +${formatMoney(0, 'CRC')} / −${formatMoney(10_106_40, 'CRC')} al tipo ${formatMoney(505_32, 'CRC')}`)
  })
  it('AC-4: sin tipo guardado no hay equivalente', () => {
    expect(render()).not.toContain('≈')
  })
})

describe('PRES-01jm-T04: tarjeta Presupuestos', () => {
  it('AC-5: sin presupuestos no se muestra', () => {
    expect(render()).not.toContain('Presupuestos')
  })
  it('muestra gastado / tope, barra y porcentaje en texto', () => {
    // Ningún gasto de noviembre del fixture tiene palabras conocidas: los ₡36 500 caen en Otros.
    const html = render({ budgets: [{ category: 'Otros', limitCents: 50_000_00 }] })
    expect(html).toContain('Presupuestos')
    expect(html).toContain(`${formatMoney(36_500_00, 'CRC')} de ${formatMoney(50_000_00, 'CRC')}`)
    expect(html).toMatch(/<progress[^>]*max="100"[^>]*value="73"|<progress[^>]*value="73"[^>]*max="100"/)
    expect(html).toContain('73 %')
  })
})

describe('PROY-01jm-T02: tarjeta Fin de mes', () => {
  it('AC-3: negativo con signo menos, "Te faltarían" y desglose en texto', () => {
    // Saldo 100 000 (salario) y una compra con tarjeta de 200 000 que vence el 20 nov sin pagar.
    const credit = [tx('2026-10-25T10:00:00-06:00', 200_000_00, 'out', 'Tele', { paymentMethod: 'credit' })]
    const html = render({ transactions: credit })
    expect(html).toMatch(/<h2[^>]*>Fin de mes<\/h2>/)
    expect(html).toContain('Te faltarían')
    expect(html).toContain(`−${formatMoney(100_000_00, 'CRC')}`)
    expect(html).toMatch(/Cuotas de tarjeta hasta fin de mes.*−₡200.000,00/)
  })
  it('AC-4: sin saldo ni salario no se muestra', () => {
    expect(render({ transactions: [], settings: { salaryCents: null, account: null } })).not.toContain('Fin de mes')
  })
})
