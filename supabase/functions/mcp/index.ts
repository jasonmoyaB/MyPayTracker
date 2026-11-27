// MCP-01jm-T03: conector MCP (Streamable HTTP sin estado). Solo I/O; el protocolo vive en tools.ts.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { numericToCents } from '../../../src/domain/money.ts'
import { allPages } from '../../../src/domain/paging.ts'
import { handleRpc, type Ledger, type Query, type SaveSettings } from './tools.ts'

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Falta el secret ${name}`)
  return value
}

const SUPABASE_URL = env('SUPABASE_URL')
const RESOURCE = `${SUPABASE_URL}/functions/v1/mcp`
const METADATA = `${RESOURCE}/.well-known/oauth-protected-resource`

const COLUMNS = 'amount, currency, direction, source, description, occurred_at, payment_method'
// deno-lint-ignore no-explicit-any
const toMovement = (r: any) => ({
  amountCents: numericToCents(r.amount),
  currency: r.currency,
  direction: r.direction,
  source: r.source,
  description: r.description,
  occurredAt: r.occurred_at,
  paymentMethod: r.payment_method,
})

const unauthorized = () => Response.json({ error: 'unauthorized' }, {
  status: 401,
  headers: { 'WWW-Authenticate': `Bearer resource_metadata="${METADATA}"` },
})

Deno.serve(async (req) => {
  try {
    // Público: le dice al cliente MCP que el servidor OAuth es Supabase Auth (RFC 9728).
    if (new URL(req.url).pathname.endsWith('/.well-known/oauth-protected-resource')) {
      return Response.json({ resource: RESOURCE, authorization_servers: [`${SUPABASE_URL}/auth/v1`], bearer_methods_supported: ['header'] })
    }
    // Sin estado: no hay stream SSE que abrir con GET.
    if (req.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })

    // Se despliega con --no-verify-jwt: este 401 con WWW-Authenticate es lo que dispara el login OAuth del cliente.
    // MCP-01jm-T07: el esquema "Bearer" no distingue mayúsculas (RFC 7235).
    const token = req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1]
    if (!token) return unauthorized()
    // Cliente con el JWT del usuario: RLS filtra sus filas. Nunca la service_role.
    const db = createClient(SUPABASE_URL, env('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: auth } = await db.auth.getUser(token)
    if (!auth.user) return unauthorized()

    const query: Query = async (desdeIso, hastaIso, opts = {}) => {
      let q = db
        .from('transactions')
        .select(COLUMNS)
        .gte('occurred_at', desdeIso)
        .lt('occurred_at', hastaIso)
        .order('occurred_at', { ascending: false })
      if (opts.direction) q = q.eq('direction', opts.direction)
      if (opts.limit) q = q.limit(opts.limit)
      const { data, error } = await q
      if (error) throw error
      return data.map(toMovement)
    }
    // MCP-02jm-T02: igual que listTransactions + getSettings en la app.
    // ARQ-02jm-T03: paginado como la app para no perder historia más allá de 1000 filas.
    const ledger: Ledger = async () => {
      const [settings, reminders, transactions] = await Promise.all([
        db.from('settings').select('salary, account_balance, account_balance_at, card_paid_through').maybeSingle(),
        // FIJ-01jm-T04: los apartados restan en puedo_comprar como en el Resumen.
        // FIJ-01jm-T05: sin la 0018 aplicada (42703) se reintenta sin reserve, como listReminders en la app.
        db.from('reminders').select('description, amount, currency, day, paid_on, reserve')
          .then((r) => r.error?.code === '42703' ? db.from('reminders').select('description, amount, currency, day, paid_on') : r),
        allPages(async (from, to) => {
          const { data, error } = await db.from('transactions').select(`${COLUMNS}, installments`)
            .order('occurred_at', { ascending: false })
            .order('id', { ascending: false })
            .range(from, to)
          if (error) throw error
          return data
        }),
      ])
      if (settings.error) throw settings.error
      if (reminders.error) throw reminders.error
      const s = settings.data
      return {
        settings: {
          salaryCents: s ? numericToCents(s.salary) : null,
          account: s?.account_balance_at ? { cents: numericToCents(s.account_balance), asOf: s.account_balance_at } : null,
          cardPaidThrough: s?.card_paid_through ?? null,
        },
        transactions: transactions.map((r) => ({ ...toMovement(r), installments: r.installments })),
        reminders: reminders.data.map((r) => ({ description: r.description, amountCents: numericToCents(r.amount), currency: r.currency,
          day: r.day, paidOn: r.paid_on, reserve: r.reserve === true })),
      }
    }

    // MCP-03jm-T01: como upsertSettings en la app; user_id sale del token (nunca del asistente) y RLS lo vuelve a exigir.
    const userId = auth.user.id
    const save: SaveSettings = async (fields) => {
      const { error } = await db.from('settings').upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() })
      if (error) throw error
    }

    let msg
    try {
      msg = await req.json()
    } catch {
      return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido' } }, { status: 400 })
    }
    // MCP-01jm-T07: sin batches (MCP 2025-06-18 los quitó); null, arrays o primitivos no son un mensaje.
    if (typeof msg !== 'object' || msg === null || Array.isArray(msg)) {
      return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Petición inválida' } }, { status: 400 })
    }
    const res = await handleRpc(msg, query, ledger, save)
    return res ? Response.json(res) : new Response(null, { status: 202 })
  } catch (e) {
    // El detalle (puede traer datos internos de PostgREST) solo va al log.
    console.error('mcp falló:', e)
    return Response.json({ error: 'internal_error' }, { status: 500 })
  }
})
