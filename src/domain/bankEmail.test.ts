import { describe, expect, it } from 'vitest'
import { gmailBodyText, htmlToText, parseBacPurchase, parseBacSinpe, parseBankEmail } from './bankEmail'
import compraCrc from './__fixtures__/bac-compra-crc.txt?raw'
import compraUsd from './__fixtures__/bac-compra-usd.txt?raw'
import sinpeOk from './__fixtures__/bac-sinpe-acreditado.txt?raw'
import sinpeRechazado from './__fixtures__/bac-sinpe-rechazado.txt?raw'
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

describe('AC-2: SINPE BAC', () => {
  it('SINPE acreditado → ingreso con concepto y hora 24h de Costa Rica', () => {
    expect(parseBacSinpe(sinpeOk)).toEqual({
      amountCents: 2_000_000,
      currency: 'CRC',
      direction: 'in',
      description: 'SINPE: b_______________',
      occurredAt: '2026-10-24T21:20:13-06:00',
    })
  })
  it('en dólares usa USD', () => {
    expect(parseBacSinpe(sinpeOk.replace('Colones', 'Dólares'))).toMatchObject({ currency: 'USD' })
  })
  it('12 a.m. es medianoche y 12 p.m. es mediodía', () => {
    expect(parseBacSinpe(sinpeOk.replace('09:20:13 p.m.', '12:05:00 a.m.'))?.occurredAt).toBe('2026-10-24T00:05:00-06:00')
    expect(parseBacSinpe(sinpeOk.replace('09:20:13 p.m.', '12:05:00 p.m.'))?.occurredAt).toBe('2026-10-24T12:05:00-06:00')
  })
  it('AC-3: SINPE rechazado → null', () => {
    expect(parseBacSinpe(sinpeRechazado)).toBeNull()
  })
})

// Gmail entrega el cuerpo en base64url sobre bytes UTF-8.
const b64url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

describe('parseBankEmail: el remitente elige el parser', () => {
  it('NotificacionBAC → compra, sin importar mayúsculas', () => {
    expect(parseBankEmail('notificacionbac@baccredomatic.cr', compraCrc)?.direction).toBe('out')
  })
  it('"BAC - SINPE <notificaciones@…>" → SINPE', () => {
    expect(parseBankEmail('BAC - SINPE <notificaciones@baccredomatic.cr>', sinpeOk)?.direction).toBe('in')
  })
  it('AC-3: remitente desconocido → null', () => {
    expect(parseBankEmail('promo@otro.com', compraCrc)).toBeNull()
  })
})

describe('AC-4: gmailBodyText', () => {
  it('multipart: prefiere text/html anidado, decodifica UTF-8 y lo pasa a texto', () => {
    const payload = {
      mimeType: 'multipart/mixed',
      parts: [
        { mimeType: 'image/jpeg', body: {} },
        {
          mimeType: 'multipart/alternative',
          parts: [
            { mimeType: 'text/plain', body: { data: b64url('plano') } },
            { mimeType: 'text/html', body: { data: b64url('<b>Transacción</b>') } },
          ],
        },
      ],
    }
    expect(gmailBodyText(payload)).toBe('Transacción')
  })
  it('sin html usa text/plain', () => {
    expect(gmailBodyText({ mimeType: 'text/plain', body: { data: b64url('Monto: CRC 1.00') } })).toBe('Monto: CRC 1.00')
  })
  it('sin cuerpo → cadena vacía', () => {
    expect(gmailBodyText({ mimeType: 'multipart/mixed', parts: [] })).toBe('')
  })
})
