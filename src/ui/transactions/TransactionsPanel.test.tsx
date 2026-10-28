import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsPanel } from './TransactionsPanel'
import { formatDate, formatMoney } from '../format'
import type { Transaction } from '../../data/transactions'

vi.mock('../../data/transactions', () => ({ addManualTransaction: vi.fn() }))

const transaction: Transaction = {
  id: '1', amountCents: 349050, currency: 'CRC', direction: 'out', source: 'manual',
  description: 'Compra semanal', occurredAt: '2026-10-28T13:45:00-06:00',
}

describe('AC-5: lista de movimientos', () => {
  it('muestra estado vacío y la acción de registro', () => {
    const html = renderToStaticMarkup(<TransactionsPanel transactions={[]} onTransactionSaved={() => {}} />)
    expect(html).toContain('Aun no hay movimientos')
    expect(html).toContain('Registrar movimiento')
  })
  it('distingue gastos e ingresos con texto, signo, origen y formatos compartidos', () => {
    const income = { ...transaction, id: '2', direction: 'in' as const, source: 'email_regex' as const }
    const html = renderToStaticMarkup(<TransactionsPanel transactions={[transaction, income]} onTransactionSaved={() => {}} />)
    expect(html).toContain('<ul')
    expect(html.match(/<li /g)).toHaveLength(2)
    for (const text of ['Compra semanal', 'Gasto', 'Ingreso', 'Manual', 'Correo BAC',
      formatDate(transaction.occurredAt), `−${formatMoney(349050, 'CRC')}`, `+${formatMoney(349050, 'CRC')}`]) {
      expect(html).toContain(text)
    }
  })
})
