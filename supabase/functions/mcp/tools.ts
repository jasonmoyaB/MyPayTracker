// MCP-01jm-T02: JSON-RPC de MCP sin estado y sin SDK; puro para testearlo sin red. La I/O vive en index.ts.
import { costaRicaDateTime, costaRicaIso } from '../../../src/domain/date.ts'
import { centsToNumeric } from '../../../src/domain/money.ts'
import { costaRicaMonth, monthStats, parseMonth, topExpenses, type SpendMovement } from '../../../src/domain/monthStats.ts'

// Movimientos (ya en centavos) con occurred_at en [desdeIso, hastaIso), más recientes primero.
export type Query = (desdeIso: string, hastaIso: string) => Promise<SpendMovement[]>
type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> }

const VERSIONS = ['2025-06-18', '2025-03-26']
const MAX_MOVEMENTS = 200
const DAY_MS = 86400000

const TOOLS = [
  {
    name: 'resumen_mes',
    description: 'Ingresos, gastos y neto en colones (CRC) de un mes en hora de Costa Rica, y los 10 comercios con más gasto.',
    inputSchema: { type: 'object', properties: { mes: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: 'YYYY-MM; por defecto el mes en curso' } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'movimientos',
    description: `Movimientos entre dos fechas (inclusive, hora de Costa Rica), más recientes primero, máximo ${MAX_MOVEMENTS}. Cada uno trae su moneda: no sumes CRC con USD.`,
    inputSchema: {
      type: 'object',
      properties: {
        desde: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
        hasta: { type: 'string', format: 'date', description: 'YYYY-MM-DD, inclusive' },
        tipo: { type: 'string', enum: ['in', 'out'], description: 'in = ingresos, out = gastos; sin filtro por defecto' },
      },
      required: ['desde', 'hasta'],
    },
    annotations: { readOnlyHint: true },
  },
]

// centsToNumeric no maneja negativos y el neto puede serlo.
const signed = (cents: number) => (cents < 0 ? '-' : '') + centsToNumeric(Math.abs(cents))
const iso = (ms: number) => new Date(ms).toISOString()
const text = (value: unknown, isError = false) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }], ...(isError && { isError }) })

async function resumenMes(args: Record<string, unknown>, query: Query) {
  const mes = args.mes ?? costaRicaDateTime(new Date()).slice(0, 7)
  const now = typeof mes === 'string' ? parseMonth(mes) : null
  if (!now) return text('mes inválido: usa el formato YYYY-MM, p. ej. 2026-11.', true)
  const { startMs, endMs } = costaRicaMonth(now)
  const rows = await query(iso(startMs), iso(endMs))
  const stats = monthStats(rows, now)
  return text({
    mes, moneda: 'CRC', ingresos: signed(stats.incomeCents), gastos: signed(stats.expenseCents), neto: signed(stats.netCents),
    top_comercios: topExpenses(rows, now, 10).map((t) => ({ comercio: t.description, monto: centsToNumeric(t.cents) })),
  })
}

// Inicio del día en CR (ms) o null si no es una fecha real YYYY-MM-DD.
const dayStart = (day: unknown) => {
  const at = typeof day === 'string' ? costaRicaIso(`${day}T00:00`) : null
  return at ? Date.parse(at) : null
}

async function movimientos(args: Record<string, unknown>, query: Query) {
  const desde = dayStart(args.desde)
  const hasta = dayStart(args.hasta)
  if (desde === null || hasta === null) return text('desde y hasta son obligatorias, con formato YYYY-MM-DD, p. ej. 2026-11-01.', true)
  if (desde > hasta) return text('desde no puede ser posterior a hasta.', true)
  if (args.tipo !== undefined && args.tipo !== 'in' && args.tipo !== 'out') return text('tipo debe ser "in" (ingresos) o "out" (gastos).', true)
  const rows = (await query(iso(desde), iso(hasta + DAY_MS))).filter((m) => !args.tipo || m.direction === args.tipo)
  return text({
    total: rows.length,
    movimientos: rows.slice(0, MAX_MOVEMENTS).map((m) => ({
      fecha: m.occurredAt, descripcion: m.description, monto: centsToNumeric(m.amountCents),
      moneda: m.currency, tipo: m.direction, metodo_pago: m.paymentMethod,
    })),
  })
}

const HANDLERS: Record<string, typeof resumenMes> = { resumen_mes: resumenMes, movimientos }

async function result(msg: Rpc, query: Query): Promise<{ result: unknown } | { error: { code: number; message: string } }> {
  const params = msg.params ?? {}
  switch (msg.method) {
    case 'initialize': {
      const asked = params.protocolVersion
      const protocolVersion = typeof asked === 'string' && VERSIONS.includes(asked) ? asked : VERSIONS[0]
      return { result: { protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'mypaytracker', version: '1.0.0' } } }
    }
    case 'ping':
      return { result: {} }
    case 'tools/list':
      return { result: { tools: TOOLS } }
    case 'tools/call': {
      // hasOwn: un nombre como "toString" no debe resolver a algo del prototipo.
      const handler = Object.hasOwn(HANDLERS, String(params.name)) ? HANDLERS[String(params.name)] : null
      if (!handler) return { error: { code: -32602, message: `Herramienta desconocida: ${params.name}` } }
      return { result: await handler((params.arguments ?? {}) as Record<string, unknown>, query) }
    }
    default:
      return { error: { code: -32601, message: `Método no soportado: ${msg.method}` } }
  }
}

// null = notificación (sin id): index.ts responde 202 sin cuerpo.
export async function handleRpc(msg: Rpc, query: Query) {
  if (msg.id === undefined || msg.id === null) return null
  return { jsonrpc: '2.0', id: msg.id, ...(await result(msg, query)) }
}
