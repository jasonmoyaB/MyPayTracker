import { describe, expect, it, vi } from 'vitest'
import { onUnhandledRejection } from './unhandledRejection'

vi.mock('../data/auth', () => ({ endExpiredSession: vi.fn(() => Promise.resolve()) }))

describe('AC-2/AC-3: promesas sin capturar', () => {
  it('avisan con un mensaje amigable y se desuscriben', () => {
    const listeners = new Map<string, (e: { reason: unknown }) => void>()
    const target = {
      addEventListener: (type: string, l: (e: { reason: unknown }) => void) => { listeners.set(type, l) },
      removeEventListener: (type: string) => { listeners.delete(type) },
    }
    const notify = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const stop = onUnhandledRejection(notify, target)
    listeners.get('unhandledrejection')?.({ reason: new TypeError('Failed to fetch') })
    expect(notify).toHaveBeenCalledWith('Sin conexión. Revisa tu internet e intenta de nuevo.')
    stop()
    expect(listeners.size).toBe(0)
  })
})
