import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addGoal, deleteGoal, listGoals, updateGoalSaved } from './savings'

const db = vi.hoisted(() => {
  const result = { error: null as unknown }
  const row = { id: 'g1', name: 'Diciembre', target: '500000.00', currency: 'CRC', deadline: '2026-12-01', saved: 100000 }
  const order = vi.fn(async () => ({ data: [row], error: result.error }))
  const select = vi.fn(() => ({ order }))
  const insert = vi.fn(async () => result)
  const eq = vi.fn(async () => result)
  const update = vi.fn(() => ({ eq }))
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, insert, update, delete: del }))
  return { result, select, insert, update, eq, del, from }
})
vi.mock('./supabase', () => ({ supabase: { from: db.from } }))

// Sin Supabase local: se revisa la migración como texto (no se aplica en esta entrega).
const sql = readFileSync(new URL('../../supabase/migrations/0020_savings_goals.sql', import.meta.url), 'utf8')

describe('META-01jm-T01: tabla savings_goals', () => {
  it('dueño por defecto, montos positivos, moneda CRC/USD, fecha límite e índice por user_id', () => {
    expect(sql).toMatch(/create table public\.savings_goals/)
    expect(sql).toMatch(/id uuid primary key default gen_random_uuid\(\)/)
    expect(sql).toMatch(/user_id uuid not null default auth\.uid\(\) references auth\.users \(id\) on delete cascade/)
    expect(sql).toMatch(/name text not null check \(char_length\(trim\(name\)\) between 1 and 80\)/)
    expect(sql).toMatch(/target numeric\(12, 2\) not null check \(target > 0\)/)
    expect(sql).toMatch(/currency text not null check \(currency in \('CRC', 'USD'\)\)/)
    expect(sql).toMatch(/deadline date not null check \(extract\(day from deadline\) = 1\)/)
    expect(sql).toMatch(/saved numeric\(12, 2\) not null default 0 check \(saved >= 0\)/)
    expect(sql).toMatch(/created_at timestamptz not null default now\(\)/)
    expect(sql).toMatch(/create index savings_goals_user_idx on public\.savings_goals \(user_id\)/)
  })
  it('RLS del dueño; solo actualiza saved (privilegio de columna)', () => {
    expect(sql).toContain('alter table public.savings_goals enable row level security')
    for (const op of ['select', 'insert', 'update', 'delete']) {
      expect(sql).toMatch(new RegExp(String.raw`for ${op} to authenticated[\s\S]*?\(select auth\.uid\(\)\) = user_id`))
    }
    expect(sql).toMatch(/revoke insert, update on public\.savings_goals from authenticated/)
    expect(sql).toMatch(/grant insert \(name, target, currency, deadline, saved\), update \(saved\) on public\.savings_goals to authenticated/)
  })
})

describe('META-01jm-T03: CRUD de metas (RLS filtra por dueño)', () => {
  beforeEach(() => { vi.clearAllMocks(); db.result.error = null })
  it('listGoals mapea a centavos enteros y mes AAAA-MM', async () => {
    expect(await listGoals()).toEqual([{ id: 'g1', name: 'Diciembre', targetCents: 500_000_00, currency: 'CRC', deadline: '2026-12', savedCents: 100_000_00 }])
    expect(db.from).toHaveBeenCalledWith('savings_goals')
  })
  it('addGoal inserta sin id ni user_id, con el día 1 del mes', async () => {
    await addGoal({ name: 'Viaje', targetCents: 1_500_00, currency: 'USD', deadline: '2027-03', savedCents: 0 })
    expect(db.insert).toHaveBeenCalledWith({ name: 'Viaje', target: '1500.00', currency: 'USD', deadline: '2027-03-01', saved: '0.00' })
  })
  it('updateGoalSaved solo manda saved; deleteGoal borra por id', async () => {
    await updateGoalSaved('g1', 150_000_50)
    expect(db.update).toHaveBeenCalledWith({ saved: '150000.50' })
    expect(db.eq).toHaveBeenCalledWith('id', 'g1')
    await deleteGoal('g2')
    expect(db.eq).toHaveBeenLastCalledWith('id', 'g2')
  })
  it.each(['42P01', 'PGRST205'])('sin la tabla (%s) → sin metas', async (code) => {
    db.result.error = { code }
    expect(await listGoals()).toEqual([])
  })
  it('cualquier otro error se relanza', async () => {
    db.result.error = { code: '42501' }
    await expect(listGoals()).rejects.toEqual({ code: '42501' })
    await expect(addGoal({ name: 'x', targetCents: 1, currency: 'CRC', deadline: '2027-01', savedCents: 0 })).rejects.toEqual({ code: '42501' })
    await expect(updateGoalSaved('g1', 1)).rejects.toEqual({ code: '42501' })
    await expect(deleteGoal('g1')).rejects.toEqual({ code: '42501' })
  })
})
