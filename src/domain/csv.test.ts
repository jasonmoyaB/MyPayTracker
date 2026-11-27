import { describe, expect, it } from 'vitest'
import { csvField, csvFileName, movementsCsv, type CsvMovement } from './csv'

const row: CsvMovement = {
  occurredAt: '2026-11-10T08:05:00-06:00', description: 'AUTO MERCADO', direction: 'out', currency: 'CRC',
  amountCents: 1616674, paymentMethod: 'credit', installments: 3,
}

describe('ANA-02jm-T01: csvField', () => {
  it('AC-1: comillas y comas', () => {
    expect(csvField('Soda "La Esquina", Escazú')).toBe('"Soda ""La Esquina"", Escazú"')
  })
  it('saltos de línea van entre comillas; texto simple queda igual', () => {
    expect(csvField('a\nb')).toBe('"a\nb"')
    expect(csvField('a\rb')).toBe('"a\rb"')
    expect(csvField('Súper')).toBe('Súper')
  })
  it('AC-2: neutraliza fórmulas (=, +, -, @)', () => {
    expect(csvField('=HYPERLINK(...)')).toBe("'=HYPERLINK(...)")
    for (const c of ['+', '-', '@']) expect(csvField(`${c}1`)).toBe(`'${c}1`)
    // Neutraliza antes de escapar: la coma obliga a comillas y el apóstrofo queda dentro.
    expect(csvField('=1,2')).toBe(`"'=1,2"`)
  })
})

describe('ANA-02jm-T01: movementsCsv', () => {
  const csv = movementsCsv([row, { ...row, direction: 'in', paymentMethod: 'sinpe', installments: 1, description: 'Salario' }],
    (m) => (m.direction === 'in' ? null : 'Súper'))
  const lines = csv.split('\r\n')
  it('AC-4: BOM UTF-8 y encabezados', () => {
    expect(csv.startsWith('﻿Fecha,Descripción,Tipo,Moneda,Monto,Forma de pago,Cuotas,Categoría\r\n')).toBe(true)
  })
  it('AC-3: monto desde centavos, fecha CR y tal cual se registró (monto total, no cuotas)', () => {
    expect(lines[1]).toBe('2026-11-10 08:05,AUTO MERCADO,Gasto,CRC,16166.74,Tarjeta de crédito,3,Súper')
    expect(lines[2]).toBe('2026-11-10 08:05,Salario,Ingreso,CRC,16166.74,SINPE,1,')
    expect(lines).toHaveLength(3)
  })
})

describe('ANA-02jm-T03: csvFileName', () => {
  it('usa la fecha de Costa Rica, no la UTC (a las 11 p. m. CR del 30 ya es 1 en UTC)', () => {
    expect(csvFileName(new Date('2026-11-30T23:30:00-06:00'))).toBe('movimientos-2026-11-30.csv')
  })
})
