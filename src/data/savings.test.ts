import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
