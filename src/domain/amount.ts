// "3,490.50" → 349050. null si no es un monto positivo con máximo 2 decimales.
export function parseAmountToCents(text: string): number | null {
  const m = text.trim().match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/)
  if (!m) return null
  const cents = Number(m[1].replace(/,/g, '')) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
  return cents > 0 ? cents : null
}
