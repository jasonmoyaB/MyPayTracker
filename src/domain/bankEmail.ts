// Parsers de correos BAC. Sin imports: la Edge Function (Deno) importa este archivo tal cual.

export type Currency = 'CRC' | 'USD'

export type ParsedMovement = {
  amountCents: number
  currency: Currency
  direction: 'in' | 'out'
  description: string
  occurredAt: string
}

// Separador tolerante: espacios, saltos de línea y los "|" de tablas convertidas a texto.
const S = '[\\s|]*'
const CR_OFFSET = '-06:00' // Costa Rica no usa horario de verano.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ',
}

export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] !== '#') return ENTITIES[code] ?? match
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return String.fromCodePoint(n)
    })
    .replace(/\s+/g, ' ')
    .trim()
}

// "3,490" + "00" → 349000. Sin float: los centavos se suman como enteros.
function toCents(integer: string, decimals: string): number {
  return Number(integer.replace(/,/g, '')) * 100 + Number(decimals)
}

const pad = (n: number | string) => String(n).padStart(2, '0')

function crIso(year: string, month: number, day: string, hour: number, minute: string, second = '00'): string {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${minute}:${second}${CR_OFFSET}`
}

export function parseBacPurchase(text: string): ParsedMovement | null {
  const type = text.match(new RegExp(`Tipo de Transacci[oó]n:${S}([A-Z ]+?)${S}Monto`))
  if (type?.[1] !== 'COMPRA') return null
  const amount = text.match(new RegExp(`Monto:${S}(CRC|USD)\\s+([\\d,]+)\\.(\\d{2})`))
  const merchant = text.match(new RegExp(`Comercio:${S}(.+?)${S}Ciudad`))
  const date = text.match(new RegExp(`Fecha:${S}([A-Z][a-z]{2})\\s+(\\d{1,2}),\\s*(\\d{4}),\\s*(\\d{1,2}):(\\d{2})`))
  if (!amount || !merchant || !date) return null
  const month = MONTHS.indexOf(date[1]) + 1
  if (month === 0) return null
  return {
    amountCents: toCents(amount[2], amount[3]),
    currency: amount[1] as Currency,
    direction: 'out',
    description: merchant[1].trim(),
    occurredAt: crIso(date[3], month, date[2], Number(date[4]), date[5]),
  }
}
