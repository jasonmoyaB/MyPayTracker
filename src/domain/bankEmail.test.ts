import { describe, expect, it } from 'vitest'
import { htmlToText, parseBacPurchase } from './bankEmail'
import compraCrc from './__fixtures__/bac-compra-crc.txt?raw'
import compraUsd from './__fixtures__/bac-compra-usd.txt?raw'
import compraHtml from './__fixtures__/bac-compra-html.html?raw'

describe('AC-1: compra BAC', () => {
  it('compra en colones → gasto en centavos con hora de Costa Rica', () => {
    expect(parseBacPurchase(compraCrc)).toEqual({
      amountCents: 349_000,
      currency: 'CRC',
      direction: 'out',
      description: 'MC DONALD S CARTAGO ES',
      occurredAt: '2026-10-26T18:59:00-06:00',
    })
  })
  it('compra en dólares conserva la moneda', () => {
    expect(parseBacPurchase(compraUsd)).toMatchObject({ amountCents: 2_000, currency: 'USD', occurredAt: '2026-10-09T16:59:00-06:00' })
  })
  it('AC-3: tipo distinto de COMPRA → null', () => {
    expect(parseBacPurchase(compraCrc.replace('COMPRA', 'DEVOLUCION'))).toBeNull()
  })
  it('AC-3: texto sin formato BAC → null', () => {
    expect(parseBacPurchase('hola')).toBeNull()
  })
})

describe('AC-4: htmlToText', () => {
  it('quita tags y decodifica entidades para que el parser funcione con HTML', () => {
    const text = htmlToText(compraHtml)
    expect(text).toContain('Tipo de Transacción: COMPRA')
    expect(parseBacPurchase(text)).toMatchObject({ amountCents: 1_234_567, description: 'SUPER AGUILA DE ORO 9' })
  })
  it('decodifica entidades numéricas', () => {
    expect(htmlToText('<p>Jos&#233;&nbsp;&amp;</p>')).toBe('José &')
  })
})
