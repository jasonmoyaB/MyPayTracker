import { describe, expect, it } from 'vitest'
import { toAppError, type AppErrorKind } from './errors'

// Formas reales de error: fetch caído, AuthApiError de GoTrue, PostgrestError de PostgREST.
const cases: [string, unknown, AppErrorKind][] = [
  ['fetch caído (TypeError)', new TypeError('Failed to fetch'), 'offline'],
  ['AuthRetryableFetchError', { name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 }, 'offline'],
  ['credenciales inválidas', { code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' }, 'credentials'],
  ['credenciales por mensaje', new Error('Invalid login credentials'), 'credentials'],
  ['status 401', { status: 401, message: 'Unauthorized' }, 'session'],
  ['JWT vencido de PostgREST', { code: 'PGRST303', message: 'JWT expired' }, 'session'],
  ['refresh token perdido', { code: 'refresh_token_not_found', status: 400 }, 'session'],
  ['sin usuario al guardar', Object.assign(new Error('Sesión expirada'), { code: 'session_not_found' }), 'session'],
  ['AuthSessionMissingError', { name: 'AuthSessionMissingError', message: 'Auth session missing!', status: 400 }, 'session'],
  ['status 403', { status: 403, message: 'Forbidden' }, 'forbidden'],
  ['RLS (42501)', { code: '42501', message: 'new row violates row-level security policy' }, 'forbidden'],
  ['dato inválido (22P02)', { code: '22P02', message: 'invalid input syntax' }, 'invalid'],
  ['restricción (23514)', { code: '23514', message: 'violates check constraint' }, 'invalid'],
  ['error cualquiera', new Error('boom'), 'unknown'],
  ['bug (TypeError no de red)', new TypeError('Cannot read properties of undefined'), 'unknown'],
  ['texto de sesión sin código', new Error('Sesión expirada'), 'unknown'],
  ['string', 'boom', 'unknown'],
  ['null', null, 'unknown'],
]

describe('AC-3: toAppError traduce errores por tipo', () => {
  it.each(cases)('%s', (_name, input, kind) => {
    expect(toAppError(input).kind).toBe(kind)
  })

  it('nunca expone el mensaje técnico y siempre habla en español', () => {
    for (const [, input] of cases) {
      const { message } = toAppError(input)
      expect(message).not.toMatch(/fetch|jwt|row-level|syntax|boom|constraint|unauthorized|forbidden|undefined|missing/i)
      expect(message.length).toBeGreaterThan(10)
    }
  })

  it('da un mensaje distinto por tipo', () => {
    const messages = new Set(cases.map(([, input]) => toAppError(input).message))
    expect(messages.size).toBe(6)
  })
})
