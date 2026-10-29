import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addReminder, deleteReminder, listReminders } from './reminders'

const db = vi.hoisted(() => {
  const result = { error: null as unknown }
  const row = { id: 'r1', description: 'Spotify', amount: '2000.50', currency: 'CRC', day: 15 }
  const order = vi.fn(async () => ({ data: [row], error: result.error }))
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn(async () => result)
  const eq = vi.fn(async () => result)
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, insert, delete: del }))
  return { result, select, insert, eq, del, from }
})
vi.mock('./supabase', () => ({ supabase: { from: db.from } }))

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

describe('REC-01jm-T03: listar, crear y borrar recordatorios (RLS filtra por dueño)', () => {
  beforeEach(() => { vi.clearAllMocks(); db.result.error = null })

  it('listReminders mapea a centavos enteros', async () => {
    expect(await listReminders()).toEqual([{ id: 'r1', description: 'Spotify', amountCents: 200_050, currency: 'CRC', day: 15 }])
    expect(db.from).toHaveBeenCalledWith('reminders')
  })
  it('addReminder inserta el monto como numeric sin user_id (lo pone la BD)', async () => {
    await addReminder({ description: 'Spotify', amountCents: 200_050, currency: 'CRC', day: 15 })
    expect(db.insert).toHaveBeenCalledWith({ description: 'Spotify', amount: '2000.50', currency: 'CRC', day: 15 })
  })
  it('deleteReminder borra por id', async () => {
    await deleteReminder('r1')
    expect(db.eq).toHaveBeenCalledWith('id', 'r1')
  })
  it('propaga el error de Supabase', async () => {
    db.result.error = { code: '42501' }
    await expect(listReminders()).rejects.toEqual({ code: '42501' })
    await expect(addReminder({ description: 'x', amountCents: 1, currency: 'USD', day: 1 })).rejects.toEqual({ code: '42501' })
    await expect(deleteReminder('r1')).rejects.toEqual({ code: '42501' })
  })
})
