import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { addManualTransaction, deleteTransaction, listTransactions } from './transactions'

const db = vi.hoisted(() => {
  const row = { id: '1', amount: '2000.50', currency: 'CRC', direction: 'out', source: 'manual',
    description: 'Zapatos', occurred_at: '2026-10-10T18:00:00+00:00', payment_method: 'credit', installments: 3 }
  const order = vi.fn(async () => ({ data: [row], error: null }))
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn(async () => ({ error: null }))
  const eq = vi.fn(async () => ({ error: null }))
  const remove = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, insert, delete: remove }))
  return { select, insert, eq, from }
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
    expect(db.select).toHaveBeenCalledWith(expect.stringContaining('installments'))
    expect(t.installments).toBe(3)
  })
  it('addManualTransaction inserta payment_method', async () => {
    await addManualTransaction({ amountCents: 200_050, currency: 'CRC', direction: 'out', description: 'Zapatos',
      occurredAt: '2026-10-10T12:00:00-06:00', paymentMethod: 'credit', installments: 3 })
    expect(db.insert).toHaveBeenCalledWith(expect.objectContaining({ payment_method: 'credit', amount: '2000.50', installments: 3 }))
  })
})

describe('TC-02jm AC-5: installments en transactions', () => {
  const sql8 = readFileSync(new URL('../../supabase/migrations/0008_installments.sql', import.meta.url), 'utf8').toLowerCase()
  it('plazos de BAC CR con default 1', () => {
    expect(sql8).toMatch(/add column installments smallint not null default 1/)
    expect(sql8).toMatch(/check \(installments in \(1, 3, 6, 10, 12\)\)/)
  })
  it('más de un plazo solo con tarjeta', () => {
    expect(sql8).toMatch(/check \(installments = 1 or payment_method = 'credit'\)/)
  })
})

describe('TC-04jm-T01: lo que queda de un plazo cabe en 1–12 cuotas', () => {
  it('reemplaza el check de plazos por un rango', () => {
    const sql9 = readFileSync(new URL('../../supabase/migrations/0009_installments_restantes.sql', import.meta.url), 'utf8').toLowerCase()
    expect(sql9).toMatch(/drop constraint transactions_installments_check/)
    expect(sql9).toMatch(/add constraint transactions_installments_check check \(installments between 1 and 12\)/)
  })
})

describe('TC-07jm-T02: borrar una deuda', () => {
  it('AC-3: borra solo la fila de ese id (RLS limita al dueño)', async () => {
    await deleteTransaction('abc')
    expect(db.from).toHaveBeenCalledWith('transactions')
    expect(db.eq).toHaveBeenCalledWith('id', 'abc')
  })
})
