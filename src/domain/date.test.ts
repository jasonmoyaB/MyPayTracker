import { describe, expect, it } from 'vitest'
import { costaRicaDateTime, costaRicaIso } from './date'

describe('AC-6: fecha manual en Costa Rica', () => {
  it('conserva la hora local con offset -06:00', () => {
    expect(costaRicaIso('2026-10-28T13:45')).toBe('2026-10-28T13:45:00-06:00')
  })
  it('rechaza fechas inexistentes y entradas incompletas', () => {
    for (const value of ['', '2026-02-30T12:00', '2026-10-28T25:00']) {
      expect(costaRicaIso(value)).toBeNull()
    }
  })
  it('obtiene el valor inicial independientemente de la zona del navegador', () => {
    expect(costaRicaDateTime(new Date('2026-10-29T02:05:00Z'))).toBe('2026-10-28T20:05')
  })
})
