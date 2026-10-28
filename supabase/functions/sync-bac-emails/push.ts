// PWA-01jm-T06: notificación push por cada movimiento recién insertado. Nunca rompe el sync.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0'
import { numericToCents } from '../../../src/domain/money.ts'
import { type MovementInput, movementNotification } from '../../../src/domain/notification.ts'

export type PushTarget = { endpoint: string; keys: { p256dh: string; auth: string } }
export type SendPush = (target: PushTarget, payload: string) => Promise<unknown>
export type InsertedRow = { direction: string; amount: string | number; currency: string; description: string }
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
    const { data, error } = await db.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', ownerId)
    if (error) throw error
    const gone = await sendAll(data as Subscription[], rows.map(toMovement), send)
    if (gone.length > 0) {
      const { error: deleteError } = await db.from('push_subscriptions').delete().in('id', gone)
      if (deleteError) throw deleteError
    }
  } catch (e) {
    console.error('Notificaciones push fallaron:', e)
  }
}

const toMovement = (r: InsertedRow): MovementInput => ({
  direction: r.direction === 'in' ? 'in' : 'out',
  amountCents: numericToCents(r.amount),
  currency: r.currency === 'USD' ? 'USD' : 'CRC',
  description: r.description,
})

// Devuelve los ids que el servicio de push rechazó por vencidos (404/410); a esos no se reintenta.
async function sendAll(subs: Subscription[], movements: MovementInput[], send: SendPush): Promise<string[]> {
  const gone = new Set<string>()
  for (const movement of movements) {
    const payload = JSON.stringify(movementNotification(movement))
    for (const sub of subs.filter((s) => !gone.has(s.id))) {
      try {
        await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) gone.add(sub.id)
        else console.error('Push a una suscripción falló:', e)
      }
    }
  }
  return [...gone]
}
