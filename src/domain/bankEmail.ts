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

// Solo "se acreditó" genera movimiento; los SINPE rechazados no tocan el saldo.
const SINPE_RE = new RegExp(
  'se acredit[oó] .*? por un monto de ([\\d,]+)\\.(\\d{2}) (Colones|D[oó]lares), por concepto de (.*?)\\.\\s*' +
    'D[ií]a y hora:? (\\d{2})/(\\d{2})/(\\d{4}) (\\d{1,2}):(\\d{2}):(\\d{2}) ([ap])\\.\\s?m\\.',
)

export function parseBacSinpe(text: string): ParsedMovement | null {
  const m = text.match(SINPE_RE)
  if (!m) return null
  const [, integer, decimals, currencyWord, concept, day, month, year, hour, minute, second, ampm] = m
  const hour24 = (Number(hour) % 12) + (ampm === 'p' ? 12 : 0)
  return {
    amountCents: toCents(integer, decimals),
    currency: currencyWord === 'Colones' ? 'CRC' : 'USD',
    direction: 'in',
    description: `SINPE: ${concept.trim()}`,
    occurredAt: crIso(year, Number(month), day, hour24, minute, second),
  }
}

const PARSERS: Record<string, (text: string) => ParsedMovement | null> = {
  'notificacionbac@baccredomatic.cr': parseBacPurchase,
  'notificaciones@baccredomatic.cr': parseBacSinpe,
}

export const BAC_SENDERS = Object.keys(PARSERS)

// `from` puede venir como "BAC - SINPE <notificaciones@baccredomatic.cr>" o solo la dirección.
export function parseBankEmail(from: string, text: string): ParsedMovement | null {
  const address = (from.match(/<([^>]+)>/)?.[1] ?? from).trim().toLowerCase()
  return PARSERS[address]?.(text) ?? null
}

export type GmailPart = { mimeType?: string; body?: { data?: string }; parts?: GmailPart[] }

function findPart(part: GmailPart, mimeType: string): GmailPart | undefined {
  if (part.mimeType === mimeType && part.body?.data) return part
  for (const child of part.parts ?? []) {
    const found = findPart(child, mimeType)
    if (found) return found
  }
}

function decodeBase64Url(data: string): string {
  const bytes = Uint8Array.from(atob(data.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// Gmail API (format=full): el cuerpo vive en partes MIME anidadas. Se prefiere HTML porque BAC lo envía siempre.
export function gmailBodyText(payload: GmailPart): string {
  const part = findPart(payload, 'text/html') ?? findPart(payload, 'text/plain')
  return part?.body?.data ? htmlToText(decodeBase64Url(part.body.data)) : ''
}
