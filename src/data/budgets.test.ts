import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
