import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INACTIVITY_MS, MAX_SESSION_MS } from '../domain/sessionLimit'
import { watchSessionLimit } from './sessionLimit'

function fakeDocument() {
  const listeners = new Map<string, () => void>()
  return {
    visibilityState: 'visible' as DocumentVisibilityState,
    addEventListener: (type: string, fn: () => void) => { listeners.set(type, fn) },
    removeEventListener: (type: string) => { listeners.delete(type) },
    fire(type: string) { listeners.get(type)?.() },
    listeners,
  }
}

describe('AUTH-02jm AC-3/AC-4/AC-5: vigilancia del límite de sesión', () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }) })
  afterEach(() => { vi.useRealTimers() })

  it('vence por inactividad y la actividad reinicia la cuenta', () => {
    const onExpire = vi.fn()
    const doc = fakeDocument()
    watchSessionLimit(0, onExpire, doc)
    vi.advanceTimersByTime(INACTIVITY_MS - 15_000)
    doc.fire('pointerdown')
    vi.advanceTimersByTime(INACTIVITY_MS - 15_000)
    doc.fire('keydown')
    vi.advanceTimersByTime(INACTIVITY_MS)
    expect(onExpire).not.toHaveBeenCalled()
    vi.advanceTimersByTime(15_000)
    expect(onExpire).toHaveBeenCalledWith('inactividad')
  })
  it('vence por máximo aunque haya actividad, una sola vez', () => {
    const onExpire = vi.fn()
    const doc = fakeDocument()
    watchSessionLimit(0, onExpire, doc)
    for (let t = 0; t < MAX_SESSION_MS + 120_000; t += 60_000) { doc.fire('pointerdown'); vi.advanceTimersByTime(60_000) }
    expect(onExpire).toHaveBeenCalledOnce()
    expect(onExpire).toHaveBeenCalledWith('maximo')
  })
  it('al volver de segundo plano tras el límite vence sin esperar al intervalo', () => {
    const onExpire = vi.fn()
    const doc = fakeDocument()
    watchSessionLimit(0, onExpire, doc)
    doc.visibilityState = 'hidden'
    vi.setSystemTime(INACTIVITY_MS + 1)
    doc.visibilityState = 'visible'
    doc.fire('visibilitychange')
    expect(onExpire).toHaveBeenCalledWith('inactividad')
  })
  it('una sesión ya vencida al montar (recarga) vence de inmediato', () => {
    const onExpire = vi.fn()
    watchSessionLimit(-MAX_SESSION_MS - 1, onExpire, fakeDocument())
    expect(onExpire).toHaveBeenCalledWith('maximo')
  })
  it('la limpieza quita listeners e intervalo', () => {
    const onExpire = vi.fn()
    const doc = fakeDocument()
    watchSessionLimit(0, onExpire, doc)()
    vi.advanceTimersByTime(MAX_SESSION_MS * 2)
    expect(onExpire).not.toHaveBeenCalled()
    expect(doc.listeners.size).toBe(0)
  })
})
