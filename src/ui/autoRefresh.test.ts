import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { autoRefresh } from './autoRefresh'

function fakeDocument(visibilityState: DocumentVisibilityState) {
  const listeners: (() => void)[] = []
  return {
    visibilityState,
    addEventListener: (_: 'visibilitychange', fn: () => void) => listeners.push(fn),
    removeEventListener: (_: 'visibilitychange', fn: () => void) => listeners.splice(listeners.indexOf(fn), 1),
    show() { this.visibilityState = 'visible'; listeners.forEach((fn) => fn()) },
    listeners,
  }
}

describe('CRON-02jm AC-4/AC-5: recarga automática', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('recarga cada minuto con la pestaña visible', () => {
    const load = vi.fn()
    autoRefresh(load, fakeDocument('visible'))
    vi.advanceTimersByTime(60_000 * 3)
    expect(load).toHaveBeenCalledTimes(3)
  })
  it('no recarga con la pestaña oculta y recarga al volver', () => {
    const load = vi.fn()
    const doc = fakeDocument('hidden')
    autoRefresh(load, doc)
    vi.advanceTimersByTime(60_000 * 3)
    expect(load).not.toHaveBeenCalled()
    doc.show()
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('la limpieza detiene el intervalo y el listener', () => {
    const load = vi.fn()
    const doc = fakeDocument('visible')
    autoRefresh(load, doc)()
    vi.advanceTimersByTime(60_000 * 3)
    expect(load).not.toHaveBeenCalled()
    expect(doc.listeners).toHaveLength(0)
  })
})
