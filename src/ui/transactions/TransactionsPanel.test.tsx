import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsPanel } from './TransactionsPanel'
import { formatDate, formatMoney } from '../format'
import type { Transaction } from '../../data/transactions'
import type { MovementFilter } from '../../domain/movementFilter'

vi.mock('../../data/transactions', () => ({ addManualTransaction: vi.fn() }))

const transaction: Transaction = {
  id: '1', amountCents: 349050, currency: 'CRC', direction: 'out', source: 'manual',
  description: 'Compra semanal', occurredAt: '2026-10-28T13:45:00-06:00', paymentMethod: 'cash',
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
