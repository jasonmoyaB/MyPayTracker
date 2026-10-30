// REC-01jm-T05: push de recordatorios y del pago de la tarjeta. Corre en cada pasada del cron (cada 5 min).
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0'
import type { Currency } from '../../../src/domain/bankEmail.ts'
import { dueOn, nextPayDay } from '../../../src/domain/credit.ts'
import { costaRicaDateTime } from '../../../src/domain/date.ts'
import { numericToCents } from '../../../src/domain/money.ts'
import { nextDueOn, reminderNotification, reminderPhase, type ReminderPhase } from '../../../src/domain/reminder.ts'
import { pushToOwner, type SendPush, webPushSender } from './push.ts'

type Amount = { cents: number; currency: Currency }
// Aviso pendiente: la fila cuyo marcador de fecha se reclama antes de enviar.
type Due = { table: 'reminders' | 'settings'; marker: string; key: string; value: string; description: string; phase: ReminderPhase; amounts: Amount[] }

const currency = (c: string): Currency => (c === 'USD' ? 'USD' : 'CRC')

// ponytail: sin reintentos; si el cron no corre ese día o el envío falla tras reclamar, ese aviso se pierde (spec).
export async function notifyReminders(db: SupabaseClient, ownerId: string, now: Date,
  sender: () => Promise<SendPush | null> = webPushSender): Promise<void> {
  try {
    const due = [...await dueReminders(db, ownerId, now), ...await dueCard(db, ownerId, now)]
    if (due.length === 0) return
    // Sin VAPID no se reclama nada: el aviso queda para la próxima corrida.
    const send = await sender()
    if (!send) return
    const today = costaRicaDateTime(now).slice(0, 10)
    const payloads: string[] = []
    for (const d of due) {
      if (await claim(db, d, today)) payloads.push(JSON.stringify(reminderNotification(d)))
    }
    if (payloads.length > 0) await pushToOwner(db, ownerId, payloads, send)
  } catch (e) {
    console.error('Recordatorios fallaron:', e instanceof Error ? e.message : String(e))
  }
}

// service_role no tiene RLS: se filtra por el dueño a mano.
async function dueReminders(db: SupabaseClient, ownerId: string, now: Date): Promise<Due[]> {
  const { data, error } = await db.from('reminders').select('id, description, amount, currency, day, paid_on').eq('user_id', ownerId)
  if (error) throw error
  return data.flatMap((r) => {
    // REC-02jm-T03: paid_on salta el vencimiento ya pagado: ni "pronto" ni "hoy".
    const phase = reminderPhase(nextDueOn(r.day, now, r.paid_on), now)
    if (!phase) return []
    return [{ table: 'reminders' as const, marker: 'notified_on', key: 'id', value: r.id, description: r.description, phase,
      amounts: [{ cents: numericToCents(r.amount), currency: currency(r.currency) }] }]
  })
}

// Lo que vence ese 20 (dueOn): el mismo 20 splitCredit ya lo da por pagado.
async function dueCard(db: SupabaseClient, ownerId: string, now: Date): Promise<Due[]> {
  const payDay = nextPayDay(now)
  const phase = reminderPhase(payDay.slice(0, 10), now) // 00:00 CR = 06:00Z: la fecha UTC es la de CR
  if (!phase) return []
  const { data, error } = await db.from('transactions').select('amount, currency, occurred_at, installments')
    .eq('user_id', ownerId).eq('payment_method', 'credit')
  if (error) throw error
  const { crcCents, usdCents } = dueOn(data.map((t) => ({ amountCents: numericToCents(t.amount), currency: currency(t.currency),
    direction: 'out' as const, paymentMethod: 'credit' as const, occurredAt: t.occurred_at, installments: t.installments })), payDay)
  if (crcCents === 0 && usdCents === 0) return []
  return [{ table: 'settings', marker: 'card_notified_on', key: 'user_id', value: ownerId, description: 'Tarjeta de crédito', phase,
    amounts: [{ cents: crcCents, currency: 'CRC' }, { cents: usdCents, currency: 'USD' }] }]
}

// Reclamo atómico: solo una corrida logra mover el marcador a hoy (update ... where marcador is distinct from hoy).
async function claim(db: SupabaseClient, d: Due, today: string): Promise<boolean> {
  const { data, error } = await db.from(d.table).update({ [d.marker]: today }).eq(d.key, d.value)
    .or(`${d.marker}.is.null,${d.marker}.neq.${today}`).select(d.key)
  if (error) throw error
  return data.length > 0
}
