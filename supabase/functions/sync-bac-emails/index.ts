// MAIL-01jm-T05: lee correos BAC de Gmail y los guarda en transactions. Solo I/O; la lógica vive en src/domain.
import { createClient } from 'npm:@supabase/supabase-js@2.50.0'
import { BAC_SENDERS, gmailBodyText, type GmailPart, parseBankEmail } from '../../../src/domain/bankEmail.ts'
import { notifyNewMovements } from './push.ts'
import { notifyReminders } from './reminders.ts'

const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'
// CRON-02jm: desde oct 2026 sin fecha de fin (lo anterior ya está en el saldo de cuenta, BAL-01jm).
const DATE_RANGE = 'after:2026/10/01'

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Falta el secret ${name}`)
  return value
}

async function accessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env('GMAIL_CLIENT_ID'),
      client_secret: env('GMAIL_CLIENT_SECRET'),
      refresh_token: env('GMAIL_REFRESH_TOKEN'),
    }),
  })
  if (!res.ok) throw new Error(`Google OAuth ${res.status}: ${await res.text()}`)
  return (await res.json()).access_token
}

async function gmail<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Gmail ${res.status}: ${await res.text()}`)
  return res.json()
}

// Centavos enteros → "3490.00" sin pasar por float.
const toNumeric = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`

async function listMessageIds(token: string): Promise<string[]> {
  const q = encodeURIComponent(`from:(${BAC_SENDERS.join(' OR ')}) ${DATE_RANGE}`)
  const ids: string[] = []
  let pageToken = ''
  do {
    const page = await gmail<{ messages?: { id: string }[]; nextPageToken?: string }>(
      `${GMAIL}?maxResults=100&q=${q}${pageToken ? `&pageToken=${pageToken}` : ''}`,
      token,
    )
    ids.push(...(page.messages ?? []).map((m) => m.id))
    pageToken = page.nextPageToken ?? ''
  } while (pageToken)
  return ids
}

Deno.serve(async (req) => {
  try {
    const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'))
    // Solo el cron conoce el secreto (vive en Vault, ver 0003_cron.sql).
    const { data: authorized, error: authError } = await db.rpc('is_valid_cron_secret', {
      candidate: req.headers.get('x-cron-secret') ?? '',
    })
    if (authError) throw authError
    if (!authorized) return Response.json({ error: 'No autorizado' }, { status: 401 })
    // REC-01jm-T05: antes de Gmail para que un fallo de Google no los bloquee; nunca lanza (captura sus errores).
    await notifyReminders(db, env('OWNER_USER_ID'), new Date())

    const token = await accessToken()
    const ids = await listMessageIds(token)
    // Listar ids es barato; descargar cada correo no. Solo se descargan los que no están guardados.
    // ponytail: correos sin movimiento (SINPE rechazado, etc.) no se guardan y se re-descargan cada corrida; son pocos.
    const { data: stored, error: storedError } = await db
      .from('transactions')
      .select('email_message_id')
      .not('email_message_id', 'is', null)
    if (storedError) throw storedError
    const known = new Set(stored.map((r) => r.email_message_id))
    const newIds = ids.filter((id) => !known.has(id))

    const rows = []
    for (const id of newIds) {
      const msg = await gmail<{ payload: GmailPart & { headers: { name: string; value: string }[] } }>(`${GMAIL}/${id}?format=full`, token)
      const from = msg.payload.headers.find((h) => h.name.toLowerCase() === 'from')?.value ?? ''
      const parsed = parseBankEmail(from, gmailBodyText(msg.payload))
      if (!parsed) continue
      rows.push({
        user_id: env('OWNER_USER_ID'),
        amount: toNumeric(parsed.amountCents),
        currency: parsed.currency,
        direction: parsed.direction,
        source: 'email_regex',
        description: parsed.description,
        occurred_at: parsed.occurredAt,
        email_message_id: id,
      })
    }

    // service role solo aquí (servidor); ignoreDuplicates + email_message_id único → idempotente.
    // El select devuelve solo las filas realmente insertadas: un correo ya guardado no vuelve a notificar.
    const { data, error } = await db
      .from('transactions')
      .upsert(rows, { onConflict: 'email_message_id', ignoreDuplicates: true })
      .select('direction, amount, currency, description')
    if (error) throw error
    await notifyNewMovements(db, env('OWNER_USER_ID'), data)

    return Response.json({ scanned: ids.length, skipped: ids.length - newIds.length, parsed: rows.length, inserted: data.length })
  } catch (e) {
    // UX-02jm-T06: el detalle (puede traer cuerpos de Google o datos internos) solo va al log.
    console.error('sync-bac-emails falló:', e)
    return Response.json({ error: 'sync_failed' }, { status: 500 })
  }
})
