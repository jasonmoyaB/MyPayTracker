import { describe, expect, it } from 'vitest'
import { isCardPayment, nextDueOn, reminderNotification, reminderPhase } from './reminder'

const cr = (local: string) => new Date(`${local}-06:00`)
const money = (cents: number, currency: 'CRC' | 'USD') =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(cents / 100)

describe('REC-01jm AC-1: nextDueOn (fecha CR, hoy incluido, recortada al fin de mes)', () => {
  it('día 15 con hoy 29 oct → 15 nov', () => {
    expect(nextDueOn(15, cr('2026-10-29T12:00:00'))).toBe('2026-11-15')
  })
  it('hoy mismo cuenta, hasta las 23:59 CR', () => {
    expect(nextDueOn(15, cr('2026-11-15T23:59:00'))).toBe('2026-11-15')
  })
  it('día 31 en noviembre → 30 nov; en febrero → 28 o 29', () => {
    expect(nextDueOn(31, cr('2026-11-02T08:00:00'))).toBe('2026-11-30')
    expect(nextDueOn(31, cr('2027-02-01T08:00:00'))).toBe('2027-02-28')
    expect(nextDueOn(30, cr('2028-02-10T08:00:00'))).toBe('2028-02-29')
  })
  it('ya pasado el día recortado salta al mes siguiente; diciembre pasa a enero', () => {
    expect(nextDueOn(31, cr('2026-12-31T23:00:00'))).toBe('2026-12-31')
    expect(nextDueOn(10, cr('2026-12-11T00:00:00'))).toBe('2027-01-10')
  })
})

describe('REC-01jm AC-2: reminderPhase (3 días antes y el día, desde las 8:00 CR)', () => {
  it('12 nov → pronto; 15 nov → hoy; 13 y 14 → nada', () => {
    expect(reminderPhase('2026-11-15', cr('2026-11-12T08:00:00'))).toBe('pronto')
    expect(reminderPhase('2026-11-15', cr('2026-11-15T09:30:00'))).toBe('hoy')
    expect(reminderPhase('2026-11-15', cr('2026-11-13T10:00:00'))).toBeNull()
    expect(reminderPhase('2026-11-15', cr('2026-11-14T10:00:00'))).toBeNull()
  })
  it('antes de las 8:00 CR no avisa (madrugada)', () => {
    expect(reminderPhase('2026-11-15', cr('2026-11-15T07:59:00'))).toBeNull()
  })
})

describe('REC-01jm: texto del aviso', () => {
  it('pronto y hoy, con URL a Recordatorios', () => {
    expect(reminderNotification({ description: 'Spotify', phase: 'pronto', amounts: [{ cents: 2000_00, currency: 'CRC' }] }))
      .toEqual({ title: 'Recordatorio de pago', body: `Spotify: vence en 3 días, ${money(2000_00, 'CRC')}`, url: '/#/recordatorios' })
    expect(reminderNotification({ description: 'Spotify', phase: 'hoy', amounts: [{ cents: 2000_00, currency: 'CRC' }] }).body)
      .toBe(`Spotify: vence hoy, ${money(2000_00, 'CRC')}`)
  })
  it('CRC y USD se mencionan aparte, sin sumarlos; los montos en cero no salen', () => {
    const { body } = reminderNotification({ description: 'Tarjeta de crédito', phase: 'hoy',
      amounts: [{ cents: 30_666_70, currency: 'CRC' }, { cents: 15_00, currency: 'USD' }, { cents: 0, currency: 'USD' }] })
    expect(body).toBe(`Tarjeta de crédito: vence hoy, ${money(30_666_70, 'CRC')} y ${money(15_00, 'USD')}`)
  })
})

describe('REC-01jm-T08: isCardPayment', () => {
  it('reconoce pagos de la tarjeta con o sin tildes ni mayúsculas', () => {
    for (const d of ['Pagar tarjeta de crédito', 'pago credito', 'CRÉDITO BAC', 'pagar TC', 'Visa', 'mastercard'])
      expect(isCardPayment(d)).toBe(true)
  })
  it('no confunde otras palabras', () => {
    for (const d of ['Spotify', 'acreditar salario', 'tarjetero nuevo', 'etc', '']) expect(isCardPayment(d)).toBe(false)
  })
})

