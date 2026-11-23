import { describe, expect, it } from 'vitest'
import { INACTIVITY_MS, MAX_SESSION_MS, sessionExpiry } from './sessionLimit'

const T0 = 1_000_000

describe('AUTH-02jm AC-3/AC-4: límite de sesión', () => {
  it.each([
    ['recién iniciada', T0, T0, null],
    ['inactiva justo en el límite', T0 + INACTIVITY_MS, T0, null],
    ['inactiva 1 ms de más', T0 + INACTIVITY_MS + 1, T0, 'inactividad'],
    ['activa en el máximo justo', T0 + MAX_SESSION_MS, T0 + MAX_SESSION_MS, null],
    ['activa 1 ms pasado el máximo', T0 + MAX_SESSION_MS + 1, T0 + MAX_SESSION_MS, 'maximo'],
    ['ambos vencidos: gana el máximo', T0 + MAX_SESSION_MS + 1, T0, 'maximo'],
  ] as const)('%s', (_, now, lastActivityAt, expected) => {
    expect(sessionExpiry(now, lastActivityAt, T0)).toBe(expected)
  })
  it('límites de 5 y 30 minutos', () => {
    expect(INACTIVITY_MS).toBe(5 * 60_000)
    expect(MAX_SESSION_MS).toBe(30 * 60_000)
  })
})
