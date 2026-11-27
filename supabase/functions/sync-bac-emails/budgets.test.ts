import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatAmount } from '../../../src/domain/notification.ts'
import { notifyBudgets } from './budgets.ts'
import { fakeDb } from './fakeDb.ts'
import type { SendPush } from './push.ts'

type Row = Record<string, unknown>

const cr = (local: string) => new Date(`${local}-06:00`)
const sub = { id: 's1', user_id: 'owner', endpoint: 'https://e/1', p256dh: 'P', auth: 'A' }
const gasto = (amount: string, occurred_at = '2026-11-10T12:00:00-06:00'): Row => ({ user_id: 'owner', amount, currency: 'CRC',
  direction: 'out', source: 'email_regex', description: 'AUTO MERCADO ESCAZU', occurred_at, payment_method: 'cash', installments: 1, category: null })
const state = (transactions: Row[]) => ({
  budgets: [{ user_id: 'owner', category: 'Súper', amount: '80000.00', warned_month: null, exceeded_month: null }],
  transactions, push_subscriptions: [sub],
})
const sent = (send: ReturnType<typeof vi.fn>) => send.mock.calls.map(([, payload]) => JSON.parse(payload as string))

afterEach(() => vi.restoreAllMocks())

describe('PRES-01jm-T05: push del presupuesto, uno por categoría y mes', () => {
  it('AC-1/AC-2: 80 % avisa una vez aunque el gasto siga subiendo en el mes', async () => {
    const s = state([gasto('64000.00')])
    const { db, eqs } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyBudgets(db, 'owner', cr('2026-11-27T09:00:00'), async () => send)
    s.transactions.push(gasto('6000.00'))
    await notifyBudgets(db, 'owner', cr('2026-11-27T09:05:00'), async () => send)
    expect(sent(send)).toEqual([{ title: 'Presupuesto', url: '/#/resumen',
      body: `Súper: llevas ${formatAmount(64_000_00, 'CRC')} de ${formatAmount(80_000_00, 'CRC')}` }])
    expect(s.budgets[0].warned_month).toBe('2026-11')
    // service_role sin RLS: siempre filtra por el dueño.
    expect(eqs).toContainEqual(['budgets', 'user_id', 'owner'])
    expect(eqs).toContainEqual(['transactions', 'user_id', 'owner'])
  })
  it('AC-3: al pasar el tope avisa el 100 % una vez', async () => {
    const s = state([gasto('81000.00')])
    const { db } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyBudgets(db, 'owner', cr('2026-11-27T09:00:00'), async () => send)
    await notifyBudgets(db, 'owner', cr('2026-11-27T09:05:00'), async () => send)
    expect(sent(send).map((p) => p.title)).toEqual(['Presupuesto superado'])
    expect(s.budgets[0].exceeded_month).toBe('2026-11')
  })
  it('AC-4: el mes siguiente vuelve a avisar', async () => {
    const s = state([gasto('64000.00'), gasto('70000.00', '2026-12-03T12:00:00-06:00')])
    const { db } = fakeDb(s)
    const send = vi.fn<SendPush>(async () => {})
    await notifyBudgets(db, 'owner', cr('2026-11-27T09:00:00'), async () => send)
    await notifyBudgets(db, 'owner', cr('2026-12-05T09:00:00'), async () => send)
    expect(send).toHaveBeenCalledTimes(2)
    expect(s.budgets[0].warned_month).toBe('2026-12')
  })
  it('sin presupuestos ni aviso pendiente no pide VAPID; un error no rompe el sync', async () => {
    const sender = vi.fn(async () => null)
    await notifyBudgets(fakeDb({ budgets: [], transactions: [], push_subscriptions: [] }).db, 'owner', cr('2026-11-27T09:00:00'), sender)
    expect(sender).not.toHaveBeenCalled()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken = { from: () => { throw new Error('boom') } } as never
    await expect(notifyBudgets(broken, 'owner', new Date(), sender)).resolves.toBeUndefined()
  })
})

describe('PRES-01jm-T06: tras el 100 % no se avisa el 80 % del mismo mes', () => {
  it('gasto que baja al 85 % con exceeded_month en el mes actual no pide aviso', async () => {
    const s = state([gasto('68000.00')])
    s.budgets[0].exceeded_month = '2026-11'
    const sender = vi.fn(async () => null)
    await notifyBudgets(fakeDb(s).db, 'owner', cr('2026-11-27T09:00:00'), sender)
    expect(sender).not.toHaveBeenCalled()
    expect(s.budgets[0].warned_month).toBeNull()
  })
})
