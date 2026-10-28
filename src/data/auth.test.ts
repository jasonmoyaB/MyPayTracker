import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword } from './auth'
import { toAppError } from './errors'

const auth = vi.hoisted(() => ({ signInWithPassword: vi.fn(), updateUser: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { auth } }))

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
