// MCP-01jm-T03: conector MCP (Streamable HTTP sin estado). Solo I/O; el protocolo vive en tools.ts.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { numericToCents } from '../../../src/domain/money.ts'
import { handleRpc, type Query } from './tools.ts'

function env(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Falta el secret ${name}`)
  return value
}

const SUPABASE_URL = env('SUPABASE_URL')
const RESOURCE = `${SUPABASE_URL}/functions/v1/mcp`
const METADATA = `${RESOURCE}/.well-known/oauth-protected-resource`

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
        .select('amount, currency, direction, source, description, occurred_at, payment_method')
        .gte('occurred_at', desdeIso)
        .lt('occurred_at', hastaIso)
        .order('occurred_at', { ascending: false })
      if (opts.direction) q = q.eq('direction', opts.direction)
      if (opts.limit) q = q.limit(opts.limit)
      const { data, error } = await q
      if (error) throw error
      return data.map((r) => ({
        amountCents: numericToCents(r.amount),
        currency: r.currency,
        direction: r.direction,
        source: r.source,
        description: r.description,
        occurredAt: r.occurred_at,
        paymentMethod: r.payment_method,
      }))
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
    const res = await handleRpc(msg, query)
    return res ? Response.json(res) : new Response(null, { status: 202 })
  } catch (e) {
    // El detalle (puede traer datos internos de PostgREST) solo va al log.
    console.error('mcp falló:', e)
    return Response.json({ error: 'internal_error' }, { status: 500 })
  }
})
