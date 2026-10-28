import { describe, expect, it } from 'vitest'
import { movementNotification } from './notification'

const money = (cents: number, currency: 'CRC' | 'USD') =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(cents / 100)

describe('PWA-01jm AC-5: notificación de un movimiento', () => {
  it('gasto en colones: título "Gasto", monto y descripción', () => {
    expect(movementNotification({ direction: 'out', amountCents: 349050, currency: 'CRC', description: 'AUTO MERCADO' }))
      .toEqual({ title: 'Gasto', body: `${money(349050, 'CRC')} · AUTO MERCADO` })
  })
  it('ingreso en dólares', () => {
    expect(movementNotification({ direction: 'in', amountCents: 2000, currency: 'USD', description: 'SINPE' }))
      .toEqual({ title: 'Ingreso', body: `${money(2000, 'USD')} · SINPE` })
  })
  it('recorta la descripción a 60 caracteres', () => {
    const { body } = movementNotification({ direction: 'out', amountCents: 100, currency: 'CRC', description: 'x'.repeat(80) })
    expect(body).toBe(`${money(100, 'CRC')} · ${'x'.repeat(59)}…`)
  })
  it('sin descripción muestra solo el monto', () => {
    expect(movementNotification({ direction: 'out', amountCents: 100, currency: 'CRC', description: '  ' }).body)
      .toBe(money(100, 'CRC'))
  })
})
