// PRES-01jm-T05: push al llegar al 80 % y al pasar el 100 % del presupuesto, una vez por categoría y mes CR.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0'
import { budgetAlert, budgetStatus, type BudgetMovement } from '../../../src/domain/budget.ts'
import type { Category } from '../../../src/domain/category.ts'
import { costaRicaDateTime } from '../../../src/domain/date.ts'
import { numericToCents } from '../../../src/domain/money.ts'
import { allPages } from '../../../src/domain/paging.ts'
import { pushToOwner, type SendPush, webPushSender } from './push.ts'

type BudgetRow = { category: Category; amount: string; warned_month: string | null; exceeded_month: string | null }

// ponytail: recalcula con todos los movimientos en cada pasada (cada 5 min); aceptable con un solo dueño.
// Igual que reminders.ts: sin reintentos; si el envío falla tras reclamar, ese aviso se pierde. Nunca rompe el sync.
export async function notifyBudgets(db: SupabaseClient, ownerId: string, now: Date,
  sender: () => Promise<SendPush | null> = webPushSender): Promise<void> {
  try {
    // service_role no tiene RLS: se filtra por el dueño a mano.
    const { data, error } = await db.from('budgets').select('category, amount, warned_month, exceeded_month').eq('user_id', ownerId)
    if (error) throw error
    const rows = data as BudgetRow[]
    if (rows.length === 0) return
    const month = costaRicaDateTime(now).slice(0, 7)
    const status = budgetStatus(rows.map((b) => ({ category: b.category, limitCents: numericToCents(b.amount) })), await movements(db, ownerId), now)
    // Lo ya avisado este mes se descarta antes de pedir VAPID; el reclamo atómico cubre dos corridas a la vez.
    const due = status.flatMap((s) => {
      const alert = budgetAlert(s)
      const marker = alert?.kind === 'exceeded' ? 'exceeded_month' : 'warned_month'
      const row = rows.find((b) => b.category === s.category)
      return alert && row?.[marker] !== month ? [{ category: s.category, marker, alert }] : []
    })
    if (due.length === 0) return
    const send = await sender()
    if (!send) return
    const payloads: string[] = []
    for (const d of due) {
      const { title, body, url } = d.alert
      if (await claim(db, ownerId, d.category, d.marker, month)) payloads.push(JSON.stringify({ title, body, url }))
    }
    if (payloads.length > 0) await pushToOwner(db, ownerId, payloads, send)
  } catch (e) {
    console.error('Avisos de presupuesto fallaron:', e instanceof Error ? e.message : String(e))
  }
}

// ARQ-02jm-T03: todas las páginas; una compra vieja a plazo puede tener cuotas en este mes.
async function movements(db: SupabaseClient, ownerId: string): Promise<BudgetMovement[]> {
  const data = await allPages(async (from, to) => {
    const { data, error } = await db.from('transactions')
      .select('amount, currency, direction, source, description, occurred_at, payment_method, installments, category')
      .eq('user_id', ownerId).order('id').range(from, to)
    if (error) throw error
    return data
  })
  return data.map((t) => ({ amountCents: numericToCents(t.amount), currency: t.currency, direction: t.direction, source: t.source,
    description: t.description, occurredAt: t.occurred_at, paymentMethod: t.payment_method, installments: t.installments, category: t.category }))
}

// Mismo reclamo atómico que reminders.ts: solo una corrida mueve el marcador al mes actual.
async function claim(db: SupabaseClient, ownerId: string, category: Category, marker: string, month: string): Promise<boolean> {
  const { data, error } = await db.from('budgets').update({ [marker]: month }).eq('user_id', ownerId).eq('category', category)
    .or(`${marker}.is.null,${marker}.neq.${month}`).select('category')
  if (error) throw error
  return data.length > 0
}
