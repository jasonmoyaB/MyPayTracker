import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

export type AccountBalance = { cents: number; asOf: string }

// null = el usuario todavía no lo registró.
// TC-10jm-T03: cardPaidThrough = el 20 hasta el que pagó la tarjeta; opcional para no tocar a quien no lo usa.
// USD-01jm-T02: usdRateCents = colones por dólar en céntimos; null = sin tipo de cambio.
export type Settings = { salaryCents: number | null; account: AccountBalance | null; cardPaidThrough?: string | null; usdRateCents?: number | null }

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('salary, account_balance, account_balance_at, card_paid_through, usd_rate')
    .maybeSingle()
  if (error) throw error
  return {
    salaryCents: data ? numericToCents(data.salary) : null,
    account: data?.account_balance_at
      ? { cents: numericToCents(data.account_balance), asOf: data.account_balance_at }
      : null,
    cardPaidThrough: data?.card_paid_through ?? null,
    usdRateCents: data?.usd_rate == null ? null : numericToCents(data.usd_rate),
  }
}

async function upsertSettings(fields: Record<string, string>): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw Object.assign(new Error('Sesión expirada'), { code: 'session_not_found' })
  const { error } = await supabase
    .from('settings')
    .upsert({ user_id: auth.user.id, ...fields, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function saveSalaryCents(salaryCents: number): Promise<void> {
  return upsertSettings({ salary: centsToNumeric(salaryCents) })
}

// La fecha es "ahora": los movimientos posteriores se suman sobre este saldo.
export function saveAccountBalanceCents(cents: number): Promise<void> {
  return upsertSettings({ account_balance: centsToNumeric(cents), account_balance_at: new Date().toISOString() })
}

// USD-01jm-T02: mismo formato que un monto (2 decimales); el check de 0015 rechaza 0 o negativos.
export function saveUsdRateCents(cents: number): Promise<void> {
  return upsertSettings({ usd_rate: centsToNumeric(cents) })
}

// TC-10jm-T03: marca pagado el ciclo que vence en `dueAt` (un 20) y todos los anteriores.
export function saveCardPaidThrough(dueAt: string): Promise<void> {
  return upsertSettings({ card_paid_through: dueAt })
}
