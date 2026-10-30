import type { Currency } from '../domain/bankEmail'

// Intl formatea con el símbolo y separadores de Costa Rica; los centavos se dividen solo al mostrar.
export function formatMoney(cents: number, currency: Currency): string {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(cents / 100)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Costa_Rica' }).format(new Date(iso))
}

// Signo explícito: + para cero o positivo, − (menos tipográfico) para negativo.
export function formatSigned(cents: number, currency: Currency): string {
  return `${cents < 0 ? '−' : '+'}${formatMoney(Math.abs(cents), currency)}`
}

// TC-01jm-T04: fechas de corte/pago sin hora ("20 nov"); a las 00:00 la hora solo confunde.
export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'America/Costa_Rica' }).format(new Date(iso))
}

// TC-09jm-T01: fecha de compra con año ("10 sep 2026"): puede ser de otro año, a diferencia de los días de pago.
export function formatDayYear(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeZone: 'America/Costa_Rica' }).format(new Date(iso))
}
