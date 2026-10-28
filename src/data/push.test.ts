import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteSubscription, saveSubscription } from './push'

const db = vi.hoisted(() => {
  const result = { error: null as unknown }
  const eq = vi.fn(async () => result)
  const del = vi.fn(() => ({ eq }))
  const upsert = vi.fn(async () => result)
  const from = vi.fn(() => ({ upsert, delete: del }))
  return { result, eq, del, upsert, from }
})
vi.mock('./supabase', () => ({ supabase: { from: db.from } }))

// Sin Supabase local: se revisa la migración como texto (no se aplica en esta entrega).
const sql = readFileSync(new URL('../../supabase/migrations/0006_push_subscriptions.sql', import.meta.url), 'utf8')
  .toLowerCase()

describe('PWA-01jm AC-8: push_subscriptions solo para su dueño', () => {
  it('tabla con dueño por defecto, endpoint único y claves', () => {
    expect(sql).toMatch(/create table public\.push_subscriptions/)
    expect(sql).toMatch(/user_id uuid not null references auth\.users \(id\) on delete cascade default auth\.uid\(\)/)
    expect(sql).toMatch(/endpoint text not null unique/)
    for (const col of ['p256dh text not null', 'auth text not null']) expect(sql).toContain(col)
  })
  it('RLS activo con select/insert/delete por auth.uid() y sin update', () => {
    expect(sql).toContain('alter table public.push_subscriptions enable row level security')
    for (const op of ['select', 'insert', 'delete']) {
      expect(sql).toMatch(new RegExp(`for ${op} to authenticated[\\s\\S]*?\\(select auth\\.uid\\(\\)\\) = user_id`))
    }
    expect(sql).not.toMatch(/for (update|all)/)
  })
})

const sub = { endpoint: 'https://push.example/abc', keys: { p256dh: 'P', auth: 'A' } }

describe('PWA-01jm AC-2/AC-4: guardar y borrar la suscripción del dispositivo', () => {
  beforeEach(() => { vi.clearAllMocks(); db.result.error = null })

  it('guarda endpoint y claves; si ya existe no hace nada (sin policy update)', async () => {
    await saveSubscription(sub)
    expect(db.from).toHaveBeenCalledWith('push_subscriptions')
    expect(db.upsert).toHaveBeenCalledWith({ endpoint: sub.endpoint, p256dh: 'P', auth: 'A' },
      { onConflict: 'endpoint', ignoreDuplicates: true })
  })
  it('rechaza una suscripción sin claves', async () => {
    await expect(saveSubscription({ endpoint: sub.endpoint })).rejects.toThrow()
    expect(db.upsert).not.toHaveBeenCalled()
  })
  it('borra por endpoint', async () => {
    await deleteSubscription(sub.endpoint)
    expect(db.del).toHaveBeenCalled()
    expect(db.eq).toHaveBeenCalledWith('endpoint', sub.endpoint)
  })
  it('propaga el error de Supabase', async () => {
    db.result.error = { code: '42501' }
    await expect(saveSubscription(sub)).rejects.toEqual({ code: '42501' })
    await expect(deleteSubscription(sub.endpoint)).rejects.toEqual({ code: '42501' })
  })
})
