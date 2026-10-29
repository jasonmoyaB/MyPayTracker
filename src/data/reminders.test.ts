import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Sin Supabase local: se revisa la migración como texto (no se aplica en esta entrega).
const sql = readFileSync(new URL('../../supabase/migrations/0010_reminders.sql', import.meta.url), 'utf8')
  .toLowerCase()

describe('REC-01jm AC-6: reminders solo para su dueño', () => {
  it('tabla con dueño por defecto, monto positivo, moneda, día 1–31 y marcador de aviso', () => {
    expect(sql).toMatch(/create table public\.reminders/)
    expect(sql).toMatch(/user_id uuid not null references auth\.users \(id\) on delete cascade default auth\.uid\(\)/)
    expect(sql).toMatch(/amount numeric\(12, 2\) not null check \(amount > 0\)/)
    expect(sql).toMatch(/currency text not null check \(currency in \('crc', 'usd'\)\)/)
    expect(sql).toMatch(/day smallint not null check \(day between 1 and 31\)/)
    expect(sql).toMatch(/notified_on date/)
    expect(sql).toMatch(/create index reminders_user_idx on public\.reminders \(user_id\)/)
  })
  it('RLS activo con select/insert/delete por auth.uid() y sin update', () => {
    expect(sql).toContain('alter table public.reminders enable row level security')
    for (const op of ['select', 'insert', 'delete']) {
      expect(sql).toMatch(new RegExp(`for ${op} to authenticated[\\s\\S]*?\\(select auth\\.uid\\(\\)\\) = user_id`))
    }
    expect(sql).not.toMatch(/for (update|all)/)
  })
  it('settings.card_notified_on para el aviso de la tarjeta', () => {
    expect(sql).toMatch(/alter table public\.settings\s+add column card_notified_on date/)
  })
})
