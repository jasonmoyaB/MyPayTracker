import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { reminderNotification } from '../../../src/domain/reminder.ts'
import type { SendPush } from './push.ts'
import { notifyReminders } from './reminders.ts'

type Row = Record<string, unknown>
type State = { reminders: Row[]; settings: Row[]; transactions: Row[]; push_subscriptions: Row[] }

// Fake del cliente service role con estado: el update solo "devuelve fila" si el marcador aún no es hoy,
// como el filtro `or(... is null, ... neq hoy)` en Postgres. Así se prueba que dos corridas avisan una vez.
function fakeDb(state: State) {
  const or = vi.fn()
  const eqs: unknown[][] = []
  const from = vi.fn((table: keyof State) => {
    const q = { op: 'select', patch: {} as Row, where: {} as Row }
    const builder = {
      select: () => builder,
      eq: (col: string, val: unknown) => { eqs.push([table, col, val]); q.where[col] = val; return builder },
      or: (filter: string) => { or(table, filter); return builder },
      update: (patch: Row) => { q.op = 'update'; q.patch = patch; return builder },
      delete: () => { q.op = 'delete'; return builder },
      in: () => builder,
      then: (resolve: (r: unknown) => void) => resolve(run()),
    }
    const matches = (r: Row) => Object.entries(q.where).every(([k, v]) => r[k] === v)
    function run() {
      if (q.op === 'delete') return { error: null }
      if (q.op === 'select') return { data: state[table].filter(matches), error: null }
      const [col, today] = Object.entries(q.patch)[0]
      const claimed = state[table].filter((r) => matches(r) && r[col] !== today)
      for (const r of claimed) r[col] = today
      return { data: claimed, error: null }
    }
    return builder
  })
  return { db: { from } as never, or, eqs }
}

const cr = (local: string) => new Date(`${local}-06:00`)
const sub = { id: 's1', user_id: 'owner', endpoint: 'https://e/1', p256dh: 'P', auth: 'A' }
const state = (over: Partial<State> = {}): State => ({
  reminders: [{ id: 'r1', user_id: 'owner', description: 'Spotify', amount: '2000.00', currency: 'CRC', day: 15, notified_on: null }],
  settings: [{ user_id: 'owner', card_notified_on: null }], transactions: [], push_subscriptions: [sub], ...over,
})
const sent = (send: ReturnType<typeof vi.fn>) => send.mock.calls.map(([, payload]) => JSON.parse(payload as string))

afterEach(() => vi.restoreAllMocks())

describe('REC-01jm AC-2/AC-3: avisos de recordatorios, uno por fecha', () => {
  it('12 nov → "en 3 días"; la segunda corrida del mismo día no repite; 13 nov nada; 15 nov "hoy"', async () => {
    const s = state()
    const { db, or } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyReminders(db, 'owner', cr('2026-11-12T09:00:00'), async () => send)
    await notifyReminders(db, 'owner', cr('2026-11-12T09:05:00'), async () => send)
    await notifyReminders(db, 'owner', cr('2026-11-13T09:00:00'), async () => send)
    await notifyReminders(db, 'owner', cr('2026-11-15T09:00:00'), async () => send)
    const amounts = [{ cents: 2000_00, currency: 'CRC' as const }]
    expect(sent(send)).toEqual([
      reminderNotification({ description: 'Spotify', phase: 'pronto', amounts }),
      reminderNotification({ description: 'Spotify', phase: 'hoy', amounts }),
    ])
    expect(send.mock.calls[0][0]).toEqual({ endpoint: 'https://e/1', keys: { p256dh: 'P', auth: 'A' } })
    expect(or).toHaveBeenCalledWith('reminders', 'notified_on.is.null,notified_on.neq.2026-11-12')
    expect(s.reminders[0].notified_on).toBe('2026-11-15')
  })
  it('solo lee recordatorios del dueño (service_role no tiene RLS)', async () => {
    const { db, eqs } = fakeDb(state())
    await notifyReminders(db, 'owner', cr('2026-11-12T09:00:00'), async () => vi.fn<SendPush>(async () => {}))
    expect(eqs).toContainEqual(['reminders', 'user_id', 'owner'])
  })
  it('sin secrets VAPID no marca nada (el aviso no se pierde)', async () => {
    const s = state()
    const { db } = fakeDb(s)
    await notifyReminders(db, 'owner', cr('2026-11-12T09:00:00'), async () => null)
    expect(s.reminders[0].notified_on).toBeNull()
  })
  it('un error nunca rompe el sync', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db } = fakeDb(state())
    await expect(notifyReminders(db, 'owner', cr('2026-11-12T09:00:00'), async () => { throw new Error('vapid') })).resolves.toBeUndefined()
  })
})

describe('REC-01jm AC-4: aviso del pago de la tarjeta el 17 y el 20', () => {
  const credit = (occurred_at: string, amount: string, currency = 'CRC') =>
    ({ user_id: 'owner', payment_method: 'credit', occurred_at, amount, currency, installments: 1 })
  const transactions = [credit('2026-10-10T12:00:00-06:00', '10000.00'), credit('2026-10-11T12:00:00-06:00', '20666.70'),
    credit('2026-10-12T12:00:00-06:00', '15.00', 'USD')]
  it('17 nov: ₡30 666,70 y USD aparte, una sola vez; 20 nov: vence hoy', async () => {
    const s = state({ reminders: [], transactions })
    const { db, eqs } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyReminders(db, 'owner', cr('2026-11-17T08:30:00'), async () => send)
    await notifyReminders(db, 'owner', cr('2026-11-17T12:00:00'), async () => send)
    await notifyReminders(db, 'owner', cr('2026-11-20T08:00:00'), async () => send)
    const amounts = [{ cents: 30_666_70, currency: 'CRC' as const }, { cents: 15_00, currency: 'USD' as const }]
    expect(sent(send)).toEqual([
      reminderNotification({ description: 'Tarjeta de crédito', phase: 'pronto', amounts }),
      reminderNotification({ description: 'Tarjeta de crédito', phase: 'hoy', amounts }),
    ])
    expect(eqs).toContainEqual(['transactions', 'user_id', 'owner'])
    expect(eqs).toContainEqual(['transactions', 'payment_method', 'credit'])
    expect(s.settings[0].card_notified_on).toBe('2026-11-20')
  })
  it('sin cuotas ese 20 no avisa ni marca', async () => {
    const s = state({ reminders: [] })
    const { db } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyReminders(db, 'owner', cr('2026-11-17T09:00:00'), async () => send)
    expect(send).not.toHaveBeenCalled()
    expect(s.settings[0].card_notified_on).toBeNull()
  })
})

describe('REC-01jm AC-5: los recordatorios no dependen de Gmail', () => {
  // Importar index.ts arrancaría Deno.serve: se revisa el orden en el código fuente.
  const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8')
  it('se avisan después de validar el secreto del cron y antes de pedir el token de Gmail', () => {
    const at = source.indexOf('await notifyReminders(')
    expect(at).toBeGreaterThan(source.indexOf('if (!authorized)'))
    expect(at).toBeLessThan(source.indexOf('await accessToken()'))
  })
})
