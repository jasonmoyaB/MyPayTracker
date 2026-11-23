import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, endExpiredSession, onSessionChange, type Session } from './auth'
import { toAppError } from './errors'

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(), updateUser: vi.fn(), signOut: vi.fn(), onAuthStateChange: vi.fn(),
}))
vi.mock('./supabase', async (original) => ({ ...(await original<typeof import('./supabase')>()), supabase: { auth } }))

beforeEach(() => {
  auth.signInWithPassword.mockReset().mockResolvedValue({ error: null })
  auth.updateUser.mockReset().mockResolvedValue({ error: null })
})

describe('AC-3: cambiar contraseña exige la actual', () => {
  it('verifica la actual con el correo de la sesión y luego actualiza', async () => {
    await changePassword('yo@correo.com', 'actual123', 'nueva1234')
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'yo@correo.com', password: 'actual123' })
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'nueva1234' })
  })

  it('si la actual es incorrecta lanza error de credenciales y no cambia nada', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 } })
    const failure = await changePassword('yo@correo.com', 'mala', 'nueva1234').catch((e: unknown) => e)
    expect(toAppError(failure).kind).toBe('credentials')
    expect(auth.updateUser).not.toHaveBeenCalled()
  })

  it('si la actualización falla, propaga el error', async () => {
    const error = { code: 'weak_password', message: 'Password is too weak', status: 422 }
    auth.updateUser.mockResolvedValue({ error })
    await expect(changePassword('yo@correo.com', 'actual123', 'nueva1234')).rejects.toBe(error)
  })
  it('sin email no reautentica y falla como sesión', async () => {
    const failure = await changePassword('', 'actual123', 'nueva1234').catch((e: unknown) => e)
    expect(failure).toMatchObject({ code: 'session_not_found' })
  })
})

describe('AUTH-02jm: inicio de sesión y cierre local', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

  const sessionFrom = (user: object) => {
    let seen: Session | null = null
    auth.onAuthStateChange.mockImplementation((cb: (e: string, s: unknown) => void) => {
      cb('INITIAL_SESSION', { user: { id: 'u1', email: 'yo@correo.com', ...user } })
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    onSessionChange((s) => { seen = s })
    return seen as Session | null
  }
  it('signedInAt viene del último inicio de sesión', () => {
    expect(sessionFrom({ last_sign_in_at: '2026-11-23T10:00:00Z' })?.signedInAt).toBe(Date.parse('2026-11-23T10:00:00Z'))
  })
  it('sin último inicio de sesión cuenta desde ahora', () => {
    vi.useFakeTimers({ now: 5_000 })
    expect(sessionFrom({})?.signedInAt).toBe(5_000)
  })

  const storage = () => ({ 'sb-demo-auth-token': 'x', otra: 'y', removeItem(k: string) { delete (this as Record<string, unknown>)[k] } })
  it.each([
    ['devuelve error', () => auth.signOut.mockResolvedValue({ error: new Error('sin red') })],
    ['lanza', () => auth.signOut.mockRejectedValue(new Error('sin red'))],
  ])('AC-6: si signOut %s, borra igual la sesión de sessionStorage sin lanzar', async (_, fail) => {
    fail()
    const s = storage()
    vi.stubGlobal('sessionStorage', s)
    await expect(endExpiredSession()).resolves.toBeUndefined()
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(Object.keys(s)).toEqual(['otra', 'removeItem'])
  })
})
