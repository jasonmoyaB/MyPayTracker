import { afterEach, describe, expect, it, vi } from 'vitest'
import { movementNotification } from '../../../src/domain/notification.ts'
import { unusualNotification } from '../../../src/domain/unusual.ts'
import { fakeDb as stateDb } from './fakeDb.ts'
import { notifyNewMovements, type SendPush } from './push.ts'

// Fake mínimo del cliente service role: lee suscripciones y borra por id.
function fakeDb(subs: { id: string; endpoint: string; p256dh: string; auth: string }[]) {
  const eq = vi.fn(async () => ({ data: subs, error: null }))
  const inIds = vi.fn(async () => ({ error: null }))
  const from = vi.fn(() => ({ select: () => ({ eq }), delete: () => ({ in: inIds }) }))
  return { db: { from } as never, eq, inIds }
}
const subs = [{ id: 's1', endpoint: 'https://e/1', p256dh: 'P1', auth: 'A1' }, { id: 's2', endpoint: 'https://e/2', p256dh: 'P2', auth: 'A2' }]
const row = { direction: 'out', amount: '3490.50', currency: 'CRC', description: 'AUTO MERCADO' }

afterEach(() => vi.restoreAllMocks())

describe('PWA-01jm AC-5/AC-6: una notificación por movimiento nuevo', () => {
  it('envía a cada suscripción del dueño el texto de movementNotification', async () => {
    const { db, eq } = fakeDb(subs)
    const send = vi.fn<SendPush>(async () => {})
    await notifyNewMovements(db, 'owner', [row], async () => send)
    expect(eq).toHaveBeenCalledWith('user_id', 'owner')
    const payload = JSON.stringify(movementNotification({ direction: 'out', amountCents: 349050, currency: 'CRC', description: 'AUTO MERCADO' }))
    expect(send).toHaveBeenCalledWith({ endpoint: 'https://e/1', keys: { p256dh: 'P1', auth: 'A1' } }, payload)
    expect(send).toHaveBeenCalledTimes(2)
  })
  it('sin filas nuevas (correo ya procesado) no envía nada', async () => {
    const { db, eq } = fakeDb(subs)
    const sender = vi.fn(async () => vi.fn<SendPush>())
    await notifyNewMovements(db, 'owner', [], sender)
    expect(sender).not.toHaveBeenCalled()
    expect(eq).not.toHaveBeenCalled()
  })
  it('sin secrets VAPID (sender null) no lee suscripciones', async () => {
    const { db, eq } = fakeDb(subs)
    await notifyNewMovements(db, 'owner', [row], async () => null)
    expect(eq).not.toHaveBeenCalled()
  })
})

describe('PWA-01jm AC-9: limpieza y errores', () => {
  it('borra las suscripciones que responden 404/410 y no reintenta con ellas', async () => {
    const { db, inIds } = fakeDb(subs)
    const send = vi.fn<SendPush>(async (sub) => { if (sub.endpoint.endsWith('/1')) throw Object.assign(new Error('gone'), { statusCode: 410 }) })
    await notifyNewMovements(db, 'owner', [row, row], async () => send)
    expect(inIds).toHaveBeenCalledWith('id', ['s1'])
    expect(send).toHaveBeenCalledTimes(3)
  })
  it('otros errores solo se registran y nunca rompen el sync', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db, inIds } = fakeDb(subs)
    const send = vi.fn<SendPush>(async () => { throw Object.assign(new Error('boom'), { statusCode: 500 }) })
    await expect(notifyNewMovements(db, 'owner', [row], async () => send)).resolves.toBeUndefined()
    expect(inIds).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    await expect(notifyNewMovements(db, 'owner', [row], async () => { throw new Error('import') })).resolves.toBeUndefined()
  })
})

describe('ALR-01jm-T02: gasto raro reemplaza al push normal', () => {
  const sub = { id: 's1', user_id: 'owner', endpoint: 'https://e/1', p256dh: 'P', auth: 'A' }
  const prev = (amount: string, id: string) => ({ user_id: 'owner', direction: 'out', amount, currency: 'CRC', description: 'AUTO MERCADO', email_message_id: id })
  const fresh = { direction: 'out', amount: '95000.00', currency: 'CRC', description: 'AUTO MERCADO', email_message_id: 'm4' }
  it('con 3 anteriores del comercio manda "Gasto inusual" y no el normal; la fila nueva no cuenta como historial', async () => {
    const state = { transactions: [prev('30000.00', 'm1'), prev('28000.00', 'm2'), prev('32000.00', 'm3'), { user_id: 'owner', ...fresh }],
      push_subscriptions: [sub] }
    const { db, eqs } = stateDb(state)
    const send = vi.fn<SendPush>(async () => {})
    await notifyNewMovements(db, 'owner', [fresh], async () => send)
    expect(send.mock.calls.map(([, p]) => JSON.parse(p as string))).toEqual([
      unusualNotification({ direction: 'out', amountCents: 95_000_00, currency: 'CRC', description: 'AUTO MERCADO' }, 30_000_00)])
    // service_role sin RLS: el historial se filtra por el dueño.
    expect(eqs).toContainEqual(['transactions', 'user_id', 'owner'])
  })
  it('si el historial falla, manda el push normal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db } = stateDb({ transactions: null as never, push_subscriptions: [sub] })
    const send = vi.fn<SendPush>(async () => {})
    await notifyNewMovements(db, 'owner', [fresh], async () => send)
    expect(JSON.parse(send.mock.calls[0][1])).toMatchObject({ title: 'Gasto' })
  })
})
