import type { Currency } from '../domain/bankEmail'
import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

// REC-01jm-T03: pagos mensuales a recordar. No son movimientos: no tocan saldo ni deuda.
export type Reminder = { id: string; description: string; amountCents: number; currency: Currency; day: number }
export type NewReminder = Omit<Reminder, 'id'>

// RLS ya filtra por user_id; ordenados por día del mes.
export async function listReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase.from('reminders').select('id, description, amount, currency, day').order('day')
  if (error) throw error
  return data.map((r) => ({ id: r.id, description: r.description, amountCents: numericToCents(r.amount), currency: r.currency, day: r.day }))
}

// user_id lo pone la BD (default auth.uid()); RLS impide escribir filas de otro.
export async function addReminder(r: NewReminder): Promise<void> {
  const { error } = await supabase.from('reminders')
    .insert({ description: r.description, amount: centsToNumeric(r.amountCents), currency: r.currency, day: r.day })
  if (error) throw error
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
}
