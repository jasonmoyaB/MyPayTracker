import { describe, expect, it } from 'vitest'
import { initialTheme, nextTheme } from './theme'

describe('AC-4: tema inicial', () => {
  it('respeta la elección guardada aunque el sistema prefiera otra', () => {
    expect(initialTheme('light', true)).toBe('light')
    expect(initialTheme('dark', false)).toBe('dark')
  })
  it('sin elección válida sigue al sistema', () => {
    for (const saved of [null, '', 'sistema', 'DARK']) {
      expect(initialTheme(saved, true)).toBe('dark')
      expect(initialTheme(saved, false)).toBe('light')
    }
  })
})

describe('AC-2: alternar tema', () => {
  it('devuelve el tema opuesto', () => {
    expect(nextTheme('light')).toBe('dark')
    expect(nextTheme('dark')).toBe('light')
  })
})
