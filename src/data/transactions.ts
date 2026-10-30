import type { Currency } from '../domain/bankEmail'
import type { Direction } from '../domain/balance'
import type { PaymentMethod } from '../domain/credit'
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
  // TC-01jm-T03: credit difiere el gasto a su día de pago (ver domain/credit.ts).
  paymentMethod: PaymentMethod
  // TC-02jm-T04: plazo de tasa cero (1 = un pago); solo > 1 con tarjeta.
  installments: number
}

export type NewTransaction = Pick<Transaction, 'amountCents' | 'currency' | 'direction' | 'description' | 'occurredAt' | 'paymentMethod' | 'installments'>

// RLS ya filtra por user_id; más recientes primero.
export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, currency, direction, source, description, occurred_at, payment_method, installments')
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
    paymentMethod: r.payment_method,
    installments: r.installments,
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
    payment_method: t.paymentMethod,
    installments: t.installments,
  })
  if (error) throw error
}

// TC-07jm-T02: deuda agregada por error. RLS impide borrar filas de otro.
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
