import { centsToNumeric, numericToCents } from '../domain/money'
import type { SavingsGoal } from '../domain/savings'
import { isMissingTable } from './errors'
import { supabase } from './supabase'

export type NewSavingsGoal = Omit<SavingsGoal, 'id'>

// META-01jm-T03: metas de ahorro. RLS ya filtra por user_id; la BD guarda el mes límite como su día 1.
export async function listGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase.from('savings_goals').select('id, name, target, currency, deadline, saved').order('deadline')
  // Si 0020 aún no está aplicada, sin metas en vez de tumbar la app (criterio de listBudgets).
  if (isMissingTable(error)) return []
  if (error) throw error
  return data.map((g) => ({
    id: g.id, name: g.name, targetCents: numericToCents(g.target), currency: g.currency,
    deadline: String(g.deadline).slice(0, 7), savedCents: numericToCents(g.saved),
  }))
}

// id y user_id los pone la BD (defaults; sin privilegio de columna para el dueño).
export async function addGoal(g: NewSavingsGoal): Promise<void> {
  const { error } = await supabase.from('savings_goals').insert({
    name: g.name, target: centsToNumeric(g.targetCents), currency: g.currency, deadline: `${g.deadline}-01`, saved: centsToNumeric(g.savedCents),
  })
  if (error) throw error
}

// Solo `saved`: es la única columna que 0020 deja actualizar.
export async function updateGoalSaved(id: string, savedCents: number): Promise<void> {
  const { error } = await supabase.from('savings_goals').update({ saved: centsToNumeric(savedCents) }).eq('id', id)
  if (error) throw error
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('savings_goals').delete().eq('id', id)
  if (error) throw error
}
