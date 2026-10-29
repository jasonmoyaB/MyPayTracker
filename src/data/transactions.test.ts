import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
