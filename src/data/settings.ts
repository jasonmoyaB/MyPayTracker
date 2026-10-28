import { centsToNumeric, numericToCents } from '../domain/money'
import { supabase } from './supabase'

// null = el usuario todavía no registró su salario.
export async function getSalaryCents(): Promise<number | null> {
  const { data, error } = await supabase.from('settings').select('salary').maybeSingle()
  if (error) throw error
  return data ? numericToCents(data.salary) : null
}

export async function saveSalaryCents(salaryCents: number): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sesión expirada')
  const { error } = await supabase
    .from('settings')
    .upsert({ user_id: auth.user.id, salary: centsToNumeric(salaryCents), updated_at: new Date().toISOString() })
  if (error) throw error
}
