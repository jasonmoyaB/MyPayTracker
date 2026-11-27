import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteBudget, listBudgets, saveBudget } from './budgets'

const db = vi.hoisted(() => {
  const result = { error: null as unknown }
  const order = vi.fn(async () => ({ data: [{ category: 'Súper', amount: '80000.00' }], error: result.error }))
  const select = vi.fn(() => ({ order }))
  const upsert = vi.fn(async () => result)
  const eq = vi.fn(async () => result)
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, upsert, delete: del }))
  return { result, select, upsert, eq, del, from }
})
vi.mock('./supabase', () => ({ supabase: { from: db.from } }))

// Sin Supabase local: se revisa la migración como texto (no se aplica en esta entrega).
const sql = readFileSync(new URL('../../supabase/migrations/0017_budgets.sql', import.meta.url), 'utf8')

describe('PRES-01jm-T01: tabla budgets', () => {
  it('dueño por defecto, categoría de la lista, monto positivo, marcadores por mes y PK (user_id, category)', () => {
    expect(sql).toMatch(/create table public\.budgets/)
    expect(sql).toMatch(/user_id uuid not null default auth\.uid\(\) references auth\.users \(id\) on delete cascade/)
    expect(sql).toMatch(/category text not null check \(category in \('Súper', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Compras', 'Entretenimiento', 'Otros'\)\)/)
    expect(sql).toMatch(/amount numeric\(12, 2\) not null check \(amount > 0\)/)
    expect(sql).toMatch(/warned_month text/)
    expect(sql).toMatch(/exceeded_month text/)
    expect(sql).toMatch(/primary key \(user_id, category\)/)
  })
  it('RLS del dueño; los marcadores solo los escribe el cron (privilegios de columna)', () => {
    expect(sql).toContain('alter table public.budgets enable row level security')
    for (const op of ['select', 'insert', 'update', 'delete']) {
      expect(sql).toMatch(new RegExp(String.raw`for ${op} to authenticated[\s\S]*?\(select auth\.uid\(\)\) = user_id`))
    }
    expect(sql).toMatch(/revoke insert, update on public\.budgets from authenticated/)
    expect(sql).toMatch(/grant insert \(category, amount\), update \(category, amount\) on public\.budgets to authenticated/)
  })
})

describe('PRES-01jm-T03: listar, guardar y quitar presupuestos (RLS filtra por dueño)', () => {
  beforeEach(() => { vi.clearAllMocks(); db.result.error = null })
  it('listBudgets mapea a centavos enteros', async () => {
    expect(await listBudgets()).toEqual([{ category: 'Súper', limitCents: 80_000_00 }])
    expect(db.from).toHaveBeenCalledWith('budgets')
  })
  it('saveBudget hace upsert por (user_id, category) sin user_id (lo pone la BD)', async () => {
    await saveBudget('Súper', 80_000_00)
    expect(db.upsert).toHaveBeenCalledWith({ category: 'Súper', amount: '80000.00' }, { onConflict: 'user_id,category' })
  })
  it('deleteBudget borra por categoría', async () => {
    await deleteBudget('Súper')
    expect(db.eq).toHaveBeenCalledWith('category', 'Súper')
  })
  it('propaga el error de Supabase', async () => {
    db.result.error = { code: '42501' }
    await expect(listBudgets()).rejects.toEqual({ code: '42501' })
    await expect(saveBudget('Súper', 1)).rejects.toEqual({ code: '42501' })
    await expect(deleteBudget('Súper')).rejects.toEqual({ code: '42501' })
  })
})

describe('PRES-01jm-T07: solo "tabla no existe" da lista vacía', () => {
  beforeEach(() => { vi.clearAllMocks(); db.result.error = null })
  it.each(['42P01', 'PGRST205'])('%s → []', async (code) => {
    db.result.error = { code }
    expect(await listBudgets()).toEqual([])
  })
  it('cualquier otro error se relanza', async () => {
    db.result.error = { code: 'PGRST301' }
    await expect(listBudgets()).rejects.toEqual({ code: 'PGRST301' })
  })
})
