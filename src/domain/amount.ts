// "3,490.50" → 349050. null si no es un monto positivo con máximo 2 decimales.
export function parseAmountToCents(text: string): number | null {
  const m = text.trim().match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/)
  if (!m) return null
  const cents = Number(m[1].replace(/,/g, '')) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
  return cents > 0 ? cents : null
}

// TC-12jm-T01: comisión opcional de la tasa cero; vacía o 0 = sin comisión. null si no es un monto válido.
export function parseFeeToCents(text: string): number | null {
  return /^0*(\.0*)?$/.test(text.trim()) ? 0 : parseAmountToCents(text)
}

// TC-12jm-T02: monto a guardar de una compra = precio + comisión (la comisión solo existe a plazo).
// Separa precio y comisión para que el formulario marque cada error; total null si alguno es inválido.
export function purchaseCents(priceText: string, feeText: string, installments: number) {
  const priceCents = parseAmountToCents(priceText)
  const feeCents = installments > 1 ? parseFeeToCents(feeText) : 0
  const totalCents = priceCents === null || feeCents === null ? null : priceCents + feeCents
  return { priceCents, feeCents, totalCents }
}
