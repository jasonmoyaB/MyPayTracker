import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../toast/ToastProvider'
import { CreditCard, outsideRect } from './CreditCard'
import { pendingPurchases } from '../../domain/credit'
import { checkDebt } from './DebtForm'

vi.mock('../../data/transactions', () => ({ addManualTransaction: vi.fn() }))

const pending = { crcCents: 0, usdCents: 0, dueAt: null, scheduleCrc: {} }

describe('TC-04jm-T03: deuda que ya venía pagando', () => {
  it('el card ofrece el formulario plegable con los plazos', () => {
    const html = renderToStaticMarkup(<ToastProvider>
      <CreditCard pending={pending} limitCents={null} salaryCents={null} now={new Date()} onSaved={() => {}} dueNextCents={0} purchases={[]} />
    </ToastProvider>)
    expect(html).toMatch(/<details><summary>Agregar deuda que ya tenías<\/summary>/)
    for (const t of ['Producto', 'Precio', 'Te queda por pagar', 'Cuánto pagas por mes', 'Un solo pago', 'Tasa cero 12 meses']) expect(html).toContain(t)
  })
  it('AC-5: queda > precio, precio inválido o producto vacío no se guardan', () => {
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '1500', monthly: '' })).toHaveProperty('error')
    expect(checkDebt({ product: 'Tele', price: 'abc', remaining: '', monthly: '' })).toHaveProperty('error')
    expect(checkDebt({ product: '  ', price: '1000', remaining: '', monthly: '' })).toHaveProperty('error')
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '0', monthly: '' })).toHaveProperty('error')
  })
  it('"queda" vacío = el precio', () => {
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '', monthly: '' })).toEqual({ priceCents: 1000_00, remainingCents: 1000_00, monthlyCents: undefined })
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '600.50', monthly: '' })).toEqual({ priceCents: 1000_00, remainingCents: 600_50, monthlyCents: undefined })
  })
  it('TC-05jm AC-3/AC-4: cuota mensual opcional; inválida o 0 no se guarda', () => {
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '600', monthly: '100' })).toEqual({ priceCents: 1000_00, remainingCents: 600_00, monthlyCents: 100_00 })
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '', monthly: 'abc' })).toHaveProperty('error')
    expect(checkDebt({ product: 'Tele', price: '1000', remaining: '', monthly: '0' })).toHaveProperty('error')
  })
})

describe('TC-07jm-T01: fecha de compra', () => {
  const now = new Date('2026-10-29T12:00:00-06:00')
  const base = { product: 'Tele', price: '120000', remaining: '', monthly: '' }
  it('AC-1: 10 sep, ₡120 000 a 3 meses → guarda el precio desde esa fecha; quedan 20 nov y 20 dic', () => {
    const checked = checkDebt({ ...base, date: '2026-09-10' }, 3, now)
    expect(checked).toEqual({ priceCents: 120_000_00, remainingCents: 120_000_00, occurredAt: '2026-09-10T12:00:00-06:00' })
    const [p] = pendingPurchases([{ id: '1', description: 'Tele', occurredAt: '2026-09-10T12:00:00-06:00', amountCents: 120_000_00,
      currency: 'CRC', direction: 'out', paymentMethod: 'credit', installments: 3 }], now)
    expect(p).toMatchObject({ id: '1', remainingCents: 80_000_00, count: 2, nextDueAt: '2026-11-20T06:00:00.000Z' })
  })
  it('AC-2: fecha futura, inválida o ya pagada → error', () => {
    expect(checkDebt({ ...base, date: '2026-10-30' }, 3, now)).toHaveProperty('error')
    expect(checkDebt({ ...base, date: 'ayer' }, 3, now)).toHaveProperty('error')
    expect(checkDebt({ ...base, date: '2026-06-01' }, 3, now)).toHaveProperty('error')
    expect(checkDebt({ ...base, date: '2026-10-29' }, 3, now)).not.toHaveProperty('error')
  })
})

describe('TC-05jm-T03: productos en deuda y total del 20', () => {
  it('AC-1/AC-2: lista cada producto con lo que falta y el total del próximo 20', () => {
    const html = renderToStaticMarkup(<ToastProvider>
      <CreditCard pending={{ ...pending, crcCents: 65_000_00 }} limitCents={null} salaryCents={null} now={new Date('2026-10-29T12:00:00-06:00')}
        onSaved={() => {}} dueNextCents={15_000_00}
        purchases={[{ id: '1', description: 'Tele', currency: 'CRC', remainingCents: 60_000_00, count: 6, nextCents: 10_000_00, nextDueAt: '2026-11-20T06:00:00.000Z', dues: [] }]} />
    </ToastProvider>)
    expect(html).toMatch(/<dt>Pagas el 20 nov<\/dt><dd class="amount">₡15/)
    expect(html).toContain('Tele')
    expect(html).toMatch(/6 cuotas · próxima ₡10.000,00 el 20 nov/)
    expect(html).toMatch(/<span class="amount">₡60.000,00<\/span>/)
  })
})

describe('TC-06jm-T01: modal con el calendario de cada producto', () => {
  it('AC-1/AC-2: el producto es un botón que abre su dialog con las cuotas pendientes', () => {
    const dues = ['2026-11-20T06:00:00.000Z', '2026-12-20T06:00:00.000Z', '2027-01-20T06:00:00.000Z']
      .map((dueAt, k) => ({ dueAt, cents: k === 0 ? 11_666_68 : 11_666_66 }))
    const html = renderToStaticMarkup(<ToastProvider>
      <CreditCard pending={{ ...pending, crcCents: 35_000_00 }} limitCents={null} salaryCents={null} now={new Date('2026-10-29T12:00:00-06:00')}
        onSaved={() => {}} dueNextCents={11_666_68}
        purchases={[{ id: '1', description: 'anillo', currency: 'CRC', remainingCents: 35_000_00, count: 3, nextCents: 11_666_68, nextDueAt: dues[0].dueAt, dues }]} />
    </ToastProvider>)
    expect(html).toMatch(/<button type="button" class="dashboard-row-button" aria-haspopup="dialog"/)
    expect(html).toMatch(/<dialog[^>]*>.*<h3[^>]*>anillo<\/h3>.*Falta ₡35.000,00/)
    for (const day of ['20 nov', '20 dic', '20 ene']) expect(html).toMatch(new RegExp(`<td>${day}</td>`))
    expect(html).toContain('<th scope="col">Cuota</th>')
    expect(html).toMatch(/<form method="dialog"><button[^>]*>Cerrar<\/button><\/form>/)
  })
})

describe('TC-06jm-T02: tocar fuera cierra el modal', () => {
  const rect = { left: 100, right: 500, top: 50, bottom: 400 }
  it('fuera del recuadro sí; dentro (incluido el borde) no', () => {
    expect(outsideRect(rect, 50, 200)).toBe(true)
    expect(outsideRect(rect, 300, 450)).toBe(true)
    expect(outsideRect(rect, 300, 200)).toBe(false)
    expect(outsideRect(rect, 100, 50)).toBe(false)
  })
})
