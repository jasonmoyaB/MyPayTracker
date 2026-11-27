import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { toAppError } from './errors'
import { getSettings, saveCardPaidThrough, saveSalaryCents, saveUsdRateCents } from './settings'

const db = vi.hoisted(() => ({ user: null as { id: string } | null, upsert: vi.fn(() => Promise.resolve({ error: null })) }))
vi.mock('./supabase', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: db.user } }) },
    from: () => ({
      select: () => ({ maybeSingle: () => Promise.resolve({ data: { salary: '1.00', account_balance: null, account_balance_at: null, card_paid_through: '2026-10-20T06:00:00+00:00', usd_rate: '505.32' }, error: null }) }),
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

const sql15 = readFileSync(new URL('../../supabase/migrations/0015_usd_rate.sql', import.meta.url), 'utf8').toLowerCase()

describe('USD-01jm-T01: tipo de cambio en settings', () => {
  it('0015: usd_rate numeric(10,2) nulo con check > 0 (AC-3 en la BD)', () => {
    expect(sql15).toMatch(/alter table public\.settings\s+add column usd_rate numeric\(10, 2\) check \(usd_rate > 0\)/)
  })
})

describe('USD-01jm-T02: leer y guardar el tipo de cambio', () => {
  it('getSettings lee usd_rate en céntimos y saveUsdRateCents lo guarda como numeric', async () => {
    expect((await getSettings()).usdRateCents).toBe(505_32)
    db.user = { id: 'u1' }
    await saveUsdRateCents(505_32)
    expect(db.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'u1', usd_rate: '505.32' }))
  })
})
