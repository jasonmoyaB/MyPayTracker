import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../toast/ToastProvider'
import { CreditCard } from './CreditCard'
import { checkDebt } from './DebtForm'

vi.mock('../../data/transactions', () => ({ addManualTransaction: vi.fn() }))

const pending = { crcCents: 0, usdCents: 0, dueAt: null, scheduleCrc: {} }

describe('TC-04jm-T03: deuda que ya venía pagando', () => {
  it('el card ofrece el formulario plegable con los plazos', () => {
    const html = renderToStaticMarkup(<ToastProvider>
      <CreditCard pending={pending} limitCents={null} salaryCents={null} now={new Date()} onSaved={() => {}} />
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
