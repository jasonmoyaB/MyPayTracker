// REC-01jm-T02: fechas y texto de los recordatorios de pago. La Edge Function (Deno) lo importa: extensiones .ts.
import type { Currency } from './bankEmail.ts'
import { costaRicaDateTime } from './date.ts'
import { formatAmount } from './notification.ts'

// Constantes del dominio (spec): avisar 3 días antes y el día, nunca de madrugada.
const DAYS_BEFORE = 3
const FROM_HOUR = 8
const DAY_MS = 86_400_000

export type ReminderPhase = 'hoy' | 'pronto'

// Próxima fecha CR 'YYYY-MM-DD' (hoy incluido); 29–31 caen en el último día de los meses cortos.
export function nextDueOn(day: number, now: Date): string {
  const [y, m, d] = costaRicaDateTime(now).slice(0, 10).split('-').map(Number)
  // Date.UTC(y, mes + 1, 0) = último día del mes; también pasa dic → ene.
  const clipped = (k: number) => new Date(Date.UTC(y, m - 1 + k, Math.min(day, new Date(Date.UTC(y, m + k, 0)).getUTCDate())))
  const due = clipped(0).getUTCDate() >= d ? clipped(0) : clipped(1)
  return due.toISOString().slice(0, 10)
}

// 'hoy' el día, 'pronto' 3 días antes; null fuera de eso o antes de las 8:00 CR.
export function reminderPhase(dueOn: string, now: Date): ReminderPhase | null {
  const local = costaRicaDateTime(now)
  if (Number(local.slice(11, 13)) < FROM_HOUR) return null
  const days = (Date.parse(dueOn) - Date.parse(local.slice(0, 10))) / DAY_MS
  return days === 0 ? 'hoy' : days === DAYS_BEFORE ? 'pronto' : null
}

// Varios montos para la tarjeta: CRC y USD se mencionan aparte, nunca se suman.
export function reminderNotification({ description, phase, amounts }:
  { description: string; phase: ReminderPhase; amounts: { cents: number; currency: Currency }[] }) {
  const when = phase === 'hoy' ? 'vence hoy' : `vence en ${DAYS_BEFORE} días`
  const money = amounts.filter((a) => a.cents > 0).map((a) => formatAmount(a.cents, a.currency)).join(' y ')
  return { title: 'Recordatorio de pago', body: `${description}: ${when}, ${money}`, url: '/#/recordatorios' }
}

// REC-01jm-T08: la descripción habla de pagar la tarjeta. Sin tildes ni mayúsculas; palabra completa para no
// confundir "acreditar" o "tarjetero".
const CARD_WORDS = /\b(tarjetas?|creditos?|tc|visa|mastercard)\b/
export function isCardPayment(description: string): boolean {
  return CARD_WORDS.test(description.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase())
}
