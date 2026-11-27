import type { Category, CategoryMovement } from './category'
import type { PaymentMethod } from './credit'
import { costaRicaDateTime } from './date'
import { centsToNumeric } from './money'
import type { SummaryMovement } from './summary'

export type CsvMovement = SummaryMovement & CategoryMovement & { paymentMethod: PaymentMethod; installments: number }

// Mismo texto que las opciones del formulario (TransactionForm).
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo o débito', sinpe: 'SINPE', credit: 'Tarjeta de crédito', card_payment: 'Pago de tarjeta',
}
const HEADERS = ['Fecha', 'Descripción', 'Tipo', 'Moneda', 'Monto', 'Forma de pago', 'Cuotas', 'Categoría']

// ANA-02jm-T01: Excel ejecuta como fórmula lo que empieza con = + - @ (también tab y CR, OWASP): se antepone '.
// Se neutraliza antes de escapar para que el apóstrofo quede dentro de las comillas.
export function csvField(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

// Cada movimiento tal cual se registró (compra a plazo con su monto total). BOM para que Excel lea las tildes.
export function movementsCsv(rows: CsvMovement[], categoryOf: (m: CsvMovement) => Category | null): string {
  const lines = rows.map((m) => [
    costaRicaDateTime(new Date(m.occurredAt)).replace('T', ' '), m.description, m.direction === 'in' ? 'Ingreso' : 'Gasto',
    m.currency, centsToNumeric(m.amountCents), PAYMENT_LABELS[m.paymentMethod], String(m.installments), categoryOf(m) ?? '',
  ].map(csvField).join(','))
  return `﻿${[HEADERS.join(','), ...lines].join('\r\n')}`
}

// ANA-02jm-T03: nombre con la fecha de Costa Rica (no UTC), para que no salga con el día siguiente de noche.
export const csvFileName = (now: Date) => `movimientos-${costaRicaDateTime(now).slice(0, 10)}.csv`
