import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { addManualTransaction, listTransactions } from './transactions'

const db = vi.hoisted(() => {
  const row = { id: '1', amount: '2000.50', currency: 'CRC', direction: 'out', source: 'manual',
    description: 'Zapatos', occurred_at: '2026-10-10T18:00:00+00:00', payment_method: 'credit' }
  const order = vi.fn(async () => ({ data: [row], error: null }))
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn(async () => ({ error: null }))
  const from = vi.fn(() => ({ select, insert }))
  return { select, insert, from }
})
vi.mock('./supabase', () => ({ supabase: { from: db.from } }))

// Sin Supabase local: se revisa la migración como texto (no se aplica en esta entrega).
const sql = readFileSync(new URL('../../supabase/migrations/0007_payment_method.sql', import.meta.url), 'utf8')
  .toLowerCase()

describe('TC-01jm AC-4: payment_method en transactions', () => {
  it('columna cash|credit con default cash', () => {
    expect(sql).toMatch(/alter table public\.transactions\s+add column payment_method text not null default 'cash'/)
    expect(sql).toMatch(/check \(payment_method in \('cash', 'credit'\)\)/)
  })
  it('credit solo para gastos', () => {
    expect(sql).toMatch(/check \(payment_method = 'cash' or direction = 'out'\)/)
  })
})

describe('TC-01jm AC-4: lee y guarda el método de pago', () => {
  it('listTransactions mapea payment_method', async () => {
    const [t] = await listTransactions()
    expect(db.select).toHaveBeenCalledWith(expect.stringContaining('payment_method'))
    expect(t.paymentMethod).toBe('credit')
  })
  it('addManualTransaction inserta payment_method', async () => {
    await addManualTransaction({ amountCents: 200_050, currency: 'CRC', direction: 'out', description: 'Zapatos',
      occurredAt: '2026-10-10T12:00:00-06:00', paymentMethod: 'credit' })
    expect(db.insert).toHaveBeenCalledWith(expect.objectContaining({ payment_method: 'credit', amount: '2000.50' }))
  })
})
