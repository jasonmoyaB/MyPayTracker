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
