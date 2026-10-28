import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
