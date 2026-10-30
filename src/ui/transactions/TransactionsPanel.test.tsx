import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsPanel } from './TransactionsPanel'
import { PaymentField } from './TransactionForm'
import { effectivePaymentMethod } from './useTransactionForm'
import { formatDate, formatDay, formatMoney } from '../format'
import type { Transaction } from '../../data/transactions'
import type { MovementFilter } from '../../domain/movementFilter'

vi.mock('../../data/transactions', () => ({ addManualTransaction: vi.fn() }))

const transaction: Transaction = {
  id: '1', amountCents: 349050, currency: 'CRC', direction: 'out', source: 'manual',
  description: 'Compra semanal', occurredAt: '2026-10-28T13:45:00-06:00', paymentMethod: 'cash', installments: 1,
}
const income: Transaction = { ...transaction, id: '2', direction: 'in', source: 'email_regex', description: 'Salario' }
const all: MovementFilter = { from: null, to: null, direction: 'all' }
const render = (transactions: Transaction[], filter = all) => renderToStaticMarkup(
  <TransactionsPanel transactions={transactions} filter={filter} onFilterChange={() => {}} onTransactionSaved={() => {}} />,
)

describe('AC-5: lista de movimientos', () => {
  it('muestra estado vacío y la acción de registro', () => {
    const html = render([])
    expect(html).toContain('Aun no hay movimientos')
    expect(html).toContain('Registrar movimiento')
  })
  it('distingue gastos e ingresos con texto, signo, origen y formatos compartidos', () => {
    const html = render([transaction, income])
    expect(html).toContain('<ul')
    expect(html.match(/<li /g)).toHaveLength(2)
    for (const text of ['Compra semanal', 'Gasto', 'Ingreso', 'Manual', 'Correo BAC',
      formatDate(transaction.occurredAt), `−${formatMoney(349050, 'CRC')}`, `+${formatMoney(349050, 'CRC')}`]) {
      expect(html).toContain(text)
    }
  })
})

describe('MOV-01jm: la lista aplica el filtro', () => {
  it('lista solo lo filtrado, con los controles y los totales encima', () => {
    const html = render([transaction, income], { ...all, direction: 'in' })
    expect(html.match(/<li /g)).toHaveLength(1)
    expect(html).toContain('Salario')
    expect(html).not.toContain('Compra semanal')
    expect(html).toContain('id="filter-from"')
    expect(html.indexOf('filter-totals')).toBeLessThan(html.indexOf('<ul'))
  })
  it('AC-5: con "Desde" posterior a "Hasta" no filtra (lista completa)', () => {
    const html = render([transaction, income], { from: '2026-12-01', to: '2026-11-01', direction: 'in' })
    expect(html).toContain('filter-error')
    expect(html.match(/<li /g)).toHaveLength(2)
  })
  it('AC-6: filtro sin resultados muestra el aviso y "Limpiar filtros"', () => {
    const html = render([transaction], { from: '2027-01-01', to: '2027-01-31', direction: 'all' })
    expect(html).toContain('No hay movimientos con estos filtros')
    expect(html).toContain('Limpiar filtros')
    expect(html).not.toContain('<ul')
  })
})

describe('TC-01jm AC-4: método de pago', () => {
  const field = (direction: 'in' | 'out') => renderToStaticMarkup(
    <PaymentField state={{ direction, paymentMethod: 'credit', setPaymentMethod: () => {}, installments: 1, setInstallments: () => {} }} />)
  it('MOV-02jm AC-2: en gastos se elige efectivo/débito, SINPE o tarjeta', () => {
    const html = field('out')
    for (const text of ['Forma de pago', 'Efectivo o débito', 'value="sinpe">SINPE', 'Tarjeta de crédito']) expect(html).toContain(text)
  })
  it('MOV-02jm AC-2: en ingresos se elige efectivo/débito o SINPE, nunca tarjeta', () => {
    const html = field('in')
    for (const text of ['Forma de pago', 'value="cash" selected="">Efectivo o débito', 'value="sinpe">SINPE']) expect(html).toContain(text)
    expect(html).not.toContain('Tarjeta de crédito')
    expect(html).not.toContain('Plazo')
  })
  it('MOV-02jm AC-2: un ingreso con tarjeta se guarda en efectivo; SINPE se respeta', () => {
    expect(effectivePaymentMethod('in', 'credit')).toBe('cash')
    expect(effectivePaymentMethod('in', 'sinpe')).toBe('sinpe')
    expect(effectivePaymentMethod('out', 'sinpe')).toBe('sinpe')
    expect(effectivePaymentMethod('out', 'credit')).toBe('credit')
  })
  it('MOV-02jm AC-4: la fila SINPE dice de dónde vino', () => {
    const html = render([{ ...transaction, paymentMethod: 'sinpe' }, { ...income, paymentMethod: 'sinpe' }])
    expect(html).toContain('SINPE · Manual')
    expect(html).toContain('SINPE · Correo BAC')
  })
  it('la fila de tarjeta muestra el día de pago en lugar de "Manual"', () => {
    const html = render([{ ...transaction, paymentMethod: 'credit', occurredAt: '2026-10-28T13:45:00-06:00' }])
    expect(formatDay('2026-11-20T06:00:00.000Z')).toBe('20 nov')
    expect(html).toContain('Tarjeta · se paga el 20 nov')
    expect(html).not.toContain('Manual')
  })
})

describe('TC-02jm: plazo de tasa cero', () => {
  it('con tarjeta se elige un pago o tasa cero 3, 6, 10 o 12 meses', () => {
    const html = renderToStaticMarkup(<PaymentField state={{ direction: 'out', paymentMethod: 'credit',
      setPaymentMethod: () => {}, installments: 1, setInstallments: () => {} }} />)
    expect(html).toContain('<label for="transaction-installments">Plazo</label>')
    for (const n of [3, 6, 10, 12]) expect(html).toContain(`Tasa cero ${n} meses`)
  })
  it('con efectivo no se ofrece plazo', () => {
    const html = renderToStaticMarkup(<PaymentField state={{ direction: 'out', paymentMethod: 'cash',
      setPaymentMethod: () => {}, installments: 1, setInstallments: () => {} }} />)
    expect(html).not.toContain('Plazo')
  })
  it('la fila muestra el plazo y la primera cuota', () => {
    const html = render([{ ...transaction, paymentMethod: 'credit', installments: 6, occurredAt: '2026-10-28T13:45:00-06:00' }])
    expect(html).toContain('Tarjeta · tasa cero 6 meses · primera cuota el 20 nov')
  })
})
