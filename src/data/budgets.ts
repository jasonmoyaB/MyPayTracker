import type { Budget } from '../domain/budget'
import type { Category } from '../domain/category'
import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

// PRES-01jm-T03: topes mensuales en colones por categoría. RLS ya filtra por user_id.
export async function listBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase.from('budgets').select('category, amount').order('category')
  if (error) throw error
  return data.map((b) => ({ category: b.category, limitCents: numericToCents(b.amount) }))
}

// Crear o cambiar el tope es lo mismo: upsert por la PK. user_id lo pone la BD (default auth.uid()).
export async function saveBudget(category: Category, limitCents: number): Promise<void> {
  const { error } = await supabase.from('budgets').upsert({ category, amount: centsToNumeric(limitCents) }, { onConflict: 'user_id,category' })
  if (error) throw error
}

export async function deleteBudget(category: Category): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('category', category)
  if (error) throw error
}
