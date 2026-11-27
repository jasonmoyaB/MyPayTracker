import { afterEach, describe, expect, it, vi } from 'vitest'
import { unreadNotification } from '../../../src/domain/notification.ts'
import { fakeDb } from './fakeDb.ts'
import type { SendPush } from './push.ts'
import { saveUnread, unreadIds } from './unread.ts'

const sub = { id: 's1', user_id: 'owner', endpoint: 'https://e/1', p256dh: 'P', auth: 'A' }
const ilegible = { email_message_id: 'm1', received_at: '2026-11-27T16:00:00.000Z', notify: true }
const sinMonto = { email_message_id: 'm2', received_at: '2026-11-27T16:00:00.000Z', notify: false }
const sent = (send: ReturnType<typeof vi.fn>) => send.mock.calls.map(([, payload]) => JSON.parse(payload as string))

afterEach(() => vi.restoreAllMocks())

describe('MAIL-02jm-T03: correos ilegibles', () => {
  it('AC-1/AC-2: guarda y avisa una vez; la pasada siguiente lo da por conocido y no repite', async () => {
    const state = { unread_bank_emails: [] as Record<string, unknown>[], push_subscriptions: [sub] }
    const { db, eqs } = fakeDb(state)
    const send = vi.fn<SendPush>(async () => {})
    await saveUnread(db, 'owner', [ilegible], async () => send)
    expect(await unreadIds(db, 'owner')).toEqual(['m1'])
    await saveUnread(db, 'owner', [ilegible], async () => send)
    expect(sent(send)).toEqual([unreadNotification(ilegible.received_at)])
    expect(state.unread_bank_emails).toEqual([{ user_id: 'owner', ...ilegible }])
    // service_role sin RLS: se filtra por el dueño a mano.
    expect(eqs).toContainEqual(['unread_bank_emails', 'user_id', 'owner'])
  })
  it('AC-3/AC-4: sin monto o SINPE rechazado (notify false) se guarda pero no avisa ni pide VAPID', async () => {
    const state = { unread_bank_emails: [] as Record<string, unknown>[], push_subscriptions: [sub] }
    const sender = vi.fn(async () => null)
    await saveUnread(fakeDb(state).db, 'owner', [sinMonto], sender)
    expect(state.unread_bank_emails).toHaveLength(1)
    expect(sender).not.toHaveBeenCalled()
  })
  it('nunca rompe el sync: sin la tabla (0019 sin aplicar) no hay ids conocidos y guardar solo va al log', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken = { from: () => { throw new Error('relation does not exist') } } as never
    expect(await unreadIds(broken, 'owner')).toEqual([])
    await expect(saveUnread(broken, 'owner', [ilegible], async () => null)).resolves.toBeUndefined()
  })
})
