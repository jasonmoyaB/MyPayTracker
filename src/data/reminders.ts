import type { Currency } from '../domain/bankEmail'
import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

// REC-01jm-T03: pagos mensuales a recordar. No son movimientos: no tocan saldo ni deuda.
// REC-02jm: paidOn = fecha CR del vencimiento ya pagado (null si ninguno).
// FIJ-01jm-T03: reserve = aparta su monto de "Puedes gastar" (reservedCents).
export type Reminder = { id: string; description: string; amountCents: number; currency: Currency; day: number; paidOn?: string | null; reserve?: boolean }
export type NewReminder = Omit<Reminder, 'id' | 'paidOn'>

// RLS ya filtra por user_id; ordenados por día del mes.
export async function listReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase.from('reminders').select('id, description, amount, currency, day, paid_on, reserve').order('day')
  if (error) throw error
  return data.map((r) => ({ id: r.id, description: r.description, amountCents: numericToCents(r.amount), currency: r.currency, day: r.day, paidOn: r.paid_on, reserve: r.reserve }))
}

// user_id lo pone la BD (default auth.uid()); RLS impide escribir filas de otro.
export async function addReminder(r: NewReminder): Promise<void> {
  const { error } = await supabase.from('reminders')
    .insert({ description: r.description, amount: centsToNumeric(r.amountCents), currency: r.currency, day: r.day, reserve: r.reserve ?? false })
  if (error) throw error
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
}

// REC-02jm-T02: la BD solo deja al dueño cambiar paid_on (privilegio de columna en 0011).
export async function markReminderPaid(id: string, dueOn: string): Promise<void> {
  const { error } = await supabase.from('reminders').update({ paid_on: dueOn }).eq('id', id)
  if (error) throw error
}

// FIJ-01jm-T03: la BD solo deja al dueño cambiar paid_on y reserve (privilegios de columna en 0011 y 0018).
export async function setReminderReserve(id: string, reserve: boolean): Promise<void> {
  const { error } = await supabase.from('reminders').update({ reserve }).eq('id', id)
  if (error) throw error
}
