// PWA-01jm-T06: notificación push por cada movimiento recién insertado. Nunca rompe el sync.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0'
import { numericToCents } from '../../../src/domain/money.ts'
import { type MovementInput, movementNotification } from '../../../src/domain/notification.ts'
import { allPages } from '../../../src/domain/paging.ts'
import { unusualExpense, unusualNotification } from '../../../src/domain/unusual.ts'

export type PushTarget = { endpoint: string; keys: { p256dh: string; auth: string } }
export type SendPush = (target: PushTarget, payload: string) => Promise<unknown>
export type InsertedRow = { direction: string; amount: string | number; currency: string; description: string; email_message_id?: string | null }
type Subscription = { id: string; endpoint: string; p256dh: string; auth: string }

// Secrets VAPID solo en el servidor. Sin ellos se omite el push (el sync sigue igual).
export async function webPushSender(): Promise<SendPush | null> {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const subject = Deno.env.get('VAPID_SUBJECT')
  if (!publicKey || !privateKey || !subject) {
    console.warn('Faltan secrets VAPID: se omiten las notificaciones push')
    return null
  }
  // Import dinámico: las pruebas (Vitest) no cargan web-push.
  const { default: webpush } = await import('npm:web-push@3.6.7')
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return (target, payload) => webpush.sendNotification(target, payload)
}

// ponytail: sin outbox ni reintentos; si el envío falla tras guardar, esa notificación se pierde.
export async function notifyNewMovements(db: SupabaseClient, ownerId: string, rows: InsertedRow[],
  sender: () => Promise<SendPush | null> = webPushSender): Promise<void> {
  if (rows.length === 0) return
  try {
    const send = await sender()
    if (!send) return
    const history = await expenseHistory(db, ownerId, rows)
    // ALR-01jm-T02: el gasto raro reemplaza al push normal de ese movimiento (no llegan dos).
    const payload = (m: MovementInput) => {
      const unusual = unusualExpense(m, history)
      return unusual ? unusualNotification(m, unusual.typicalCents) : movementNotification(m)
    }
    await pushToOwner(db, ownerId, rows.map((r) => JSON.stringify(payload(toMovement(r)))), send)
  } catch (e) {
    console.error('Notificaciones push fallaron:', e instanceof Error ? e.message : String(e))
  }
}

// ALR-01jm-T02: gastos previos del dueño sin las filas recién insertadas. Si falla, [] = push normal.
// ponytail: lee todo el historial solo cuando hay gastos nuevos; filtrar por comercio en la query si crece mucho.
async function expenseHistory(db: SupabaseClient, ownerId: string, rows: InsertedRow[]): Promise<MovementInput[]> {
  if (!rows.some((r) => r.direction === 'out')) return []
  try {
    const fresh = new Set(rows.map((r) => r.email_message_id))
    const data = await allPages(async (from, to) => {
      // service_role no tiene RLS: se filtra por el dueño a mano.
      const { data, error } = await db.from('transactions').select('direction, amount, currency, description, email_message_id')
        .eq('user_id', ownerId).eq('direction', 'out').order('id').range(from, to)
      if (error) throw error
      return data
    })
    return data.filter((r) => !r.email_message_id || !fresh.has(r.email_message_id)).map(toMovement)
  } catch (e) {
    console.error('Historial para gasto raro falló:', e instanceof Error ? e.message : String(e))
    return []
  }
}

// REC-01jm-T05: envía cada payload a las suscripciones del dueño y borra las vencidas. Lo reutiliza reminders.ts.
export async function pushToOwner(db: SupabaseClient, ownerId: string, payloads: string[], send: SendPush): Promise<void> {
  const { data, error } = await db.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', ownerId)
  if (error) throw error
  const gone = await sendAll(data as Subscription[], payloads, send)
  if (gone.length === 0) return
  const { error: deleteError } = await db.from('push_subscriptions').delete().in('id', gone)
  if (deleteError) throw deleteError
}

const toMovement = (r: InsertedRow): MovementInput => ({
  direction: r.direction === 'in' ? 'in' : 'out',
  amountCents: numericToCents(r.amount),
  currency: r.currency === 'USD' ? 'USD' : 'CRC',
  description: r.description,
})

// Devuelve los ids que el servicio de push rechazó por vencidos (404/410); a esos no se reintenta.
async function sendAll(subs: Subscription[], payloads: string[], send: SendPush): Promise<string[]> {
  const gone = new Set<string>()
  for (const payload of payloads) {
    for (const sub of subs.filter((s) => !gone.has(s.id))) {
      try {
        await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) gone.add(sub.id)
        // Solo estado y mensaje: el error completo trae endpoint, cabeceras y cuerpo.
        else console.error('Push a una suscripción falló:', status, (e as Error).message)
      }
    }
  }
  return [...gone]
}
