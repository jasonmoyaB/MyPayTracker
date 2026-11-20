import { describe, expect, it, vi } from 'vitest'
import { toAppError } from './errors'
import { getSettings, saveCardPaidThrough, saveSalaryCents } from './settings'

const db = vi.hoisted(() => ({ user: null as { id: string } | null, upsert: vi.fn(() => Promise.resolve({ error: null })) }))
vi.mock('./supabase', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: db.user } }) },
    from: () => ({
      select: () => ({ maybeSingle: () => Promise.resolve({ data: { salary: '1.00', account_balance: null, account_balance_at: null, card_paid_through: '2026-10-20T06:00:00+00:00' }, error: null }) }),
      upsert: db.upsert,
    }),
  },
}))

describe('UX-02jm-T07: guardar sin usuario', () => {
  it('lanza error con código de sesión, no por texto', async () => {
    const failure = await saveSalaryCents(100).catch((e: unknown) => e)
    expect(failure).toMatchObject({ code: 'session_not_found' })
    expect(toAppError(failure).kind).toBe('session')
  })
})

describe('TC-10jm-T03: hasta dónde está pagada la tarjeta', () => {
  it('getSettings lee card_paid_through y saveCardPaidThrough lo guarda', async () => {
    expect((await getSettings()).cardPaidThrough).toBe('2026-10-20T06:00:00+00:00')
    db.user = { id: 'u1' }
    await saveCardPaidThrough('2026-11-20T06:00:00.000Z')
    expect(db.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'u1', card_paid_through: '2026-11-20T06:00:00.000Z' }))
  })
})
