// MAIL-02jm-T03: correos del BAC que el parser no leyó. Se guardan para no re-descargarlos y, si traen monto, avisan
// una vez. Nunca rompe el sync: sin 0019 aplicada se comporta como antes (re-descarga, sin aviso).
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.50.0'
import { unreadNotification } from '../../../src/domain/notification.ts'
import { allPages } from '../../../src/domain/paging.ts'
import { pushToOwner, type SendPush, webPushSender } from './push.ts'

export type UnreadRow = { email_message_id: string; received_at: string | null; notify: boolean }

const log = (what: string, e: unknown) => console.error(what, e instanceof Error ? e.message : String(e))

export async function unreadIds(db: SupabaseClient, ownerId: string): Promise<string[]> {
  try {
    // service_role no tiene RLS: se filtra por el dueño a mano. ARQ-02jm: todas las páginas.
    const rows = await allPages(async (from, to) => {
      const { data, error } = await db.from('unread_bank_emails').select('email_message_id').eq('user_id', ownerId)
        .order('email_message_id').range(from, to)
      if (error) throw error
      return data
    })
    return rows.map((r) => r.email_message_id)
  } catch (e) {
    log('Leer correos ilegibles falló:', e)
    return []
  }
}

// Como transactions: ignoreDuplicates + PK email_message_id → el select trae solo las filas nuevas, que avisan una vez.
// ponytail: sin reintentos; si el envío falla tras guardar, ese aviso se pierde.
export async function saveUnread(db: SupabaseClient, ownerId: string, rows: UnreadRow[],
  sender: () => Promise<SendPush | null> = webPushSender): Promise<void> {
  if (rows.length === 0) return
  try {
    const { data, error } = await db.from('unread_bank_emails')
      .upsert(rows.map((r) => ({ user_id: ownerId, ...r })), { onConflict: 'email_message_id', ignoreDuplicates: true })
      .select('received_at, notify')
    if (error) throw error
    const payloads = (data as UnreadRow[]).filter((r) => r.notify).map((r) => JSON.stringify(unreadNotification(r.received_at)))
    if (payloads.length === 0) return
    const send = await sender()
    if (send) await pushToOwner(db, ownerId, payloads, send)
  } catch (e) {
    log('Guardar correos ilegibles falló:', e)
  }
}
