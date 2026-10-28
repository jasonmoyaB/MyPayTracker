import { afterEach, describe, expect, it, vi } from 'vitest'
import { endExpiredSession } from '../data/auth'
import { toUiError } from './sessionExpiry'

vi.mock('../data/auth', () => ({ endExpiredSession: vi.fn(() => Promise.resolve()) }))
afterEach(() => { vi.clearAllMocks() })

describe('AC-4: sesión vencida', () => {
  it('cierra la sesión local y pide volver a entrar', () => {
    const error = toUiError({ code: 'PGRST303', message: 'JWT expired' })
    expect(error).toEqual({ kind: 'session', message: 'Tu sesión venció, vuelve a entrar.' })
    expect(endExpiredSession).toHaveBeenCalledOnce()
  })
  it('si cerrar la sesión falla, maneja el rechazo (sin bucle con unhandledrejection)', () => {
    const failed = Promise.reject(new Error('sin red'))
    const handle = vi.spyOn(failed, 'catch')
    vi.mocked(endExpiredSession).mockReturnValueOnce(failed)
    toUiError({ status: 401 })
    expect(handle).toHaveBeenCalledOnce()
  })
  it('otros errores no cierran la sesión', () => {
    expect(toUiError(new TypeError('Failed to fetch')).kind).toBe('offline')
    expect(endExpiredSession).not.toHaveBeenCalled()
  })
})
