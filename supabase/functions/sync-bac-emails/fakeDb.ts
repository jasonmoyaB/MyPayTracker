// PRES-01jm-T05: compartido por los tests de reminders.ts y budgets.ts (no es un test).
import { vi } from 'vitest'

type Row = Record<string, unknown>

// Fake del cliente service role con estado: el update solo "devuelve fila" si el marcador aún no es hoy,
// como el filtro `or(... is null, ... neq hoy)` en Postgres. Así se prueba que dos corridas avisan una vez.
export function fakeDb<S extends Record<string, Row[]>>(state: S) {
  const or = vi.fn()
  const eqs: unknown[][] = []
  const from = vi.fn((table: keyof S & string) => {
    const q = { op: 'select', patch: {} as Row, where: {} as Row, range: [0, 999], rows: [] as Row[], key: '' }
    const builder = {
      select: () => builder,
      order: () => builder,
      range: (a: number, b: number) => { q.range = [a, b]; return builder },
      eq: (col: string, val: unknown) => { eqs.push([table, col, val]); q.where[col] = val; return builder },
      or: (filter: string) => { or(table, filter); return builder },
      update: (patch: Row) => { q.op = 'update'; q.patch = patch; return builder },
      delete: () => { q.op = 'delete'; return builder },
      // MAIL-02jm-T03: como ignoreDuplicates: solo inserta (y devuelve) las filas cuya clave aún no existe.
      upsert: (rows: Row[], opts: { onConflict: string }) => { q.op = 'upsert'; q.rows = rows; q.key = opts.onConflict; return builder },
      in: () => builder,
      then: (resolve: (r: unknown) => void) => resolve(run()),
    }
    const matches = (r: Row) => Object.entries(q.where).every(([k, v]) => r[k] === v)
    function run() {
      if (q.op === 'delete') return { error: null }
      if (q.op === 'upsert') {
        const fresh = q.rows.filter((r) => !state[table].some((e) => e[q.key] === r[q.key]))
        state[table].push(...fresh)
        return { data: fresh, error: null }
      }
      // Como PostgREST: máximo 1000 filas por consulta (ARQ-02jm).
      if (q.op === 'select') return { data: state[table].filter(matches).slice(q.range[0], Math.min(q.range[1], q.range[0] + 999) + 1), error: null }
      const [col, today] = Object.entries(q.patch)[0]
      const claimed = state[table].filter((r) => matches(r) && r[col] !== today)
      for (const r of claimed) r[col] = today
      return { data: claimed, error: null }
    }
    return builder
  })
  return { db: { from } as never, or, eqs }
}
