import { describe, expect, it, vi } from 'vitest'
import { toAppError } from './errors'
import { saveSalaryCents } from './settings'

vi.mock('./supabase', () => ({ supabase: { auth: { getUser: () => Promise.resolve({ data: { user: null } }) } } }))

describe('UX-02jm-T07: guardar sin usuario', () => {
  it('lanza error con código de sesión, no por texto', async () => {
    const failure = await saveSalaryCents(100).catch((e: unknown) => e)
    expect(failure).toMatchObject({ code: 'session_not_found' })
    expect(toAppError(failure).kind).toBe('session')
  })
})
