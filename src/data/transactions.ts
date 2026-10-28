import type { Currency } from '../domain/bankEmail'
import type { Direction } from '../domain/balance'
import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

export type Source = 'email_regex' | 'email_ai' | 'manual'

export type Transaction = {
  id: string
  amountCents: number
  currency: Currency
  direction: Direction
  source: Source
  description: string
  occurredAt: string
}

export type NewTransaction = Pick<Transaction, 'amountCents' | 'currency' | 'direction' | 'description' | 'occurredAt'>

// RLS ya filtra por user_id; más recientes primero.
export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, currency, direction, source, description, occurred_at')
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data.map((r) => ({
    id: r.id,
    amountCents: numericToCents(r.amount),
    currency: r.currency,
    direction: r.direction,
    source: r.source,
    description: r.description,
    occurredAt: r.occurred_at,
  }))
}

// user_id lo pone la BD (default auth.uid()); RLS impide escribir filas de otro.
export async function addManualTransaction(t: NewTransaction): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    amount: centsToNumeric(t.amountCents),
    currency: t.currency,
    direction: t.direction,
    source: 'manual',
    description: t.description,
    occurred_at: t.occurredAt,
  })
  if (error) throw error
}
