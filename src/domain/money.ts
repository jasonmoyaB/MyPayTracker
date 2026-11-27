// PostgREST devuelve numeric como número o texto; se convierte a centavos por texto para no arrastrar errores de float.
export function numericToCents(value: string | number): number {
  const [integer, decimals = ''] = String(value).split('.')
  return Number(integer) * 100 + Number(decimals.padEnd(2, '0').slice(0, 2))
}

export function centsToNumeric(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
}

// USD-01jm-T02: equivalente informativo en colones; `rateCents` = colones por dólar en céntimos (505,32 → 50 532).
// Un solo redondeo al final, al céntimo más cercano.
export function usdToCrcCents(usdCents: number, rateCents: number): number {
  return Math.round((usdCents * rateCents) / 100)
}
