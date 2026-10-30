import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SpendMovement } from '../../../src/domain/monthStats.ts'
import { avgMonthlySpend } from '../../../src/domain/monthStats.ts'
import { splitCredit } from '../../../src/domain/credit.ts'
import { recommend } from '../../../src/domain/recommend.ts'
import { summaryFor } from '../../../src/domain/summary.ts'
import { handleRpc } from './tools.ts'

const mov = (occurredAt: string, amountCents: number, over: Partial<SpendMovement> = {}): SpendMovement => ({
  occurredAt, amountCents, direction: 'out', description: 'Super', currency: 'CRC', source: 'manual', paymentMethod: 'cash', ...over,
})
const call = (name: string, args: unknown, query = vi.fn().mockResolvedValue([]), ledger = vi.fn()) =>
  handleRpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }, query, ledger)
const payload = (res: unknown) => JSON.parse((res as { result: { content: { text: string }[] } }).result.content[0].text)

afterEach(() => vi.useRealTimers())

describe('MCP-01jm-T02: protocolo', () => {
  it('initialize devuelve la versión pedida si se soporta, si no la más nueva', async () => {
    const init = (protocolVersion: string) => handleRpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion } }, vi.fn())
    expect(await init('2025-03-26')).toEqual({ jsonrpc: '2.0', id: 1, result: {
      protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: expect.objectContaining({ name: 'mypaytracker' }),
    } })
    expect(await init('2025-11-25')).toMatchObject({ result: { protocolVersion: '2025-11-25' } })
    expect(await init('1999-01-01')).toMatchObject({ result: { protocolVersion: '2025-06-18' } })
  })
  it('ping responde vacío y las notificaciones (sin id) no tienen respuesta', async () => {
    expect(await handleRpc({ jsonrpc: '2.0', id: 'a', method: 'ping' }, vi.fn())).toEqual({ jsonrpc: '2.0', id: 'a', result: {} })
    expect(await handleRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, vi.fn())).toBeNull()
  })
  it('tools/list trae las 3 herramientas, todas de solo lectura', async () => {
    const res = await handleRpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, vi.fn()) as { result: { tools: { name: string; annotations: unknown }[] } }
    expect(res.result.tools.map((t) => t.name)).toEqual(['resumen_mes', 'movimientos', 'puedo_comprar'])
    for (const t of res.result.tools) expect(t.annotations).toEqual({ readOnlyHint: true })
  })
  it('método o herramienta desconocidos → error JSON-RPC', async () => {
    expect(await handleRpc({ jsonrpc: '2.0', id: 1, method: 'resources/list' }, vi.fn())).toMatchObject({ error: { code: -32601 } })
    expect(await call('borrar_todo', {})).toMatchObject({ error: { code: -32602 } })
  })
})

describe('AC-2: resumen_mes', () => {
  it('ingresos, gastos, neto CRC y top comercios del mes pedido; consulta el rango del mes en CR', async () => {
    const query = vi.fn().mockResolvedValue([
      mov('2026-11-02T10:00:00-06:00', 100_000, { direction: 'in', description: 'Salario' }),
      mov('2026-11-03T10:00:00-06:00', 150_050),
      mov('2026-11-04T10:00:00-06:00', 9_999, { currency: 'USD' }),
    ])
    const res = payload(await call('resumen_mes', { mes: '2026-11' }, query))
    expect(query).toHaveBeenCalledWith('2026-11-01T06:00:00.000Z', '2026-12-01T06:00:00.000Z')
    expect(res).toEqual({ mes: '2026-11', moneda: 'CRC', ingresos: '1000.00', gastos: '1500.50', neto: '-500.50',
      top_comercios: [{ comercio: 'Super', monto: '1500.50' }] })
  })
  it('sin mes usa el mes en curso de Costa Rica', async () => {
    vi.useFakeTimers({ now: new Date('2026-12-01T05:59:00Z') }) // 30 nov 23:59 en CR
    expect(payload(await call('resumen_mes', {}))).toMatchObject({ mes: '2026-11' })
  })
  it('AC-5: mes mal escrito → isError con mensaje claro', async () => {
    const res = await call('resumen_mes', { mes: '2026-13' }) as { result: { isError: boolean; content: { text: string }[] } }
    expect(res.result.isError).toBe(true)
    expect(res.result.content[0].text).toMatch(/YYYY-MM/)
  })
})

describe('AC-3: movimientos', () => {
  it('rango inclusive en hora CR, tipo y límite en la query, fecha en hora CR, monto decimal y moneda', async () => {
    const query = vi.fn().mockResolvedValue([
      mov('2026-11-03T16:00:00Z', 9_999, { currency: 'USD', description: 'Amazon', paymentMethod: 'credit' }),
    ])
    const res = payload(await call('movimientos', { desde: '2026-11-01', hasta: '2026-11-30', tipo: 'out' }, query))
    expect(query).toHaveBeenCalledWith('2026-11-01T06:00:00.000Z', '2026-12-01T06:00:00.000Z', { direction: 'out', limit: 201 })
    expect(res).toEqual({ truncado: false, movimientos: [{ fecha: '2026-11-03T10:00', descripcion: 'Amazon',
      monto: '99.99', moneda: 'USD', tipo: 'out', metodo_pago: 'credit' }] })
  })
  it('máximo 200 movimientos: pide 201 para saber si hay más', async () => {
    const query = vi.fn().mockResolvedValue(Array.from({ length: 201 }, () => mov('2026-11-03T10:00:00-06:00', 1)))
    const res = payload(await call('movimientos', { desde: '2026-11-01', hasta: '2026-11-30' }, query))
    expect(query).toHaveBeenCalledWith(expect.any(String), expect.any(String), { direction: undefined, limit: 201 })
    expect(res.truncado).toBe(true)
    expect(res.movimientos).toHaveLength(200)
  })
  it('AC-5: fechas inválidas, invertidas o tipo raro → isError sin consultar', async () => {
    const query = vi.fn()
    for (const args of [{ desde: '2026-02-30', hasta: '2026-03-01' }, { desde: '2026-11-30', hasta: '2026-11-01' },
      { desde: '2026-11-01', hasta: '2026-11-30', tipo: 'todo' }, {}]) {
      expect(await call('movimientos', args, query)).toMatchObject({ result: { isError: true } })
    }
    expect(query).not.toHaveBeenCalled()
  })
})

describe('MCP-01jm-T07: fallo de la consulta', () => {
  it('devuelve isError con texto genérico y el detalle solo al log', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await call('resumen_mes', { mes: '2026-11' }, vi.fn().mockRejectedValue({ message: 'permission denied for table x' }))
    expect(res).toMatchObject({ result: { isError: true } })
    expect(JSON.stringify(res)).not.toContain('permission denied')
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
})

describe('MCP-02jm-T02: puedo_comprar', () => {
  const NOW = new Date('2026-10-30T18:00:00Z')
  const settings = { salaryCents: 50_000_000, account: { cents: 30_000_000, asOf: '2026-10-01T06:00:00Z' } }
  const transactions = [
    { ...mov('2026-10-05T15:00:00Z', 1_000_000), installments: 1 },
    { ...mov('2026-10-10T15:00:00Z', 3_000_000, { paymentMethod: 'credit', description: 'Tienda' }), installments: 3 },
  ]
  const ledger = () => vi.fn().mockResolvedValue({ settings, transactions })

  it('AC-1: mismo resultado que recommend con las entradas del Resumen', async () => {
    vi.useFakeTimers({ now: NOW })
    const res = payload(await call('puedo_comprar', { precio: '80000', plazo: '3' }, vi.fn(), ledger()))
    const { settled, pending } = splitCredit(transactions, NOW)
    const r = recommend({ priceCents: 8_000_000, plan: 3, extraCents: 0, now: NOW, salaryCents: settings.salaryCents,
      balanceCents: summaryFor(settings, settled)!.balanceCrcCents, scheduleCrc: pending.scheduleCrc,
      spendCents: avgMonthlySpend(transactions, NOW) })
    expect(res).toMatchObject({ veredicto: r.verdict, razon: r.reason, meses: 3, cuota: (r.cuotaCents! / 100).toFixed(2), queda_hoy: expect.any(String) })
    expect(res.queda_hoy).toBe((r.leftCents < 0 ? '-' : '') + (Math.abs(r.leftCents) / 100).toFixed(2))
    expect(res.mes_a_mes).toHaveLength(3)
    expect(res.mes_a_mes[2].libre).toBe(((r.monthly[2].freeCents ?? 0) / 100).toFixed(2))
  })
  it('acepta números y "contado"; contado no trae cuota', async () => {
    vi.useFakeTimers({ now: NOW })
    const res = payload(await call('puedo_comprar', { precio: 80000, plazo: 'contado', extra: 5000 }, vi.fn(), ledger()))
    expect(res).toMatchObject({ forma_pago: 'contado', cuota: null, mes_a_mes: [] })
  })
  it('AC-2: precio o plazo inválidos → isError sin consultar', async () => {
    const l = ledger()
    for (const args of [{ precio: '-5', plazo: '3' }, { precio: 'ochenta', plazo: '3' }, { precio: '80000', plazo: '24' }, { precio: '80000' }, { precio: '80000', plazo: '3', extra: 'x' }]) {
      expect(await call('puedo_comprar', args, vi.fn(), l)).toMatchObject({ result: { isError: true } })
    }
    expect(l).not.toHaveBeenCalled()
  })
  it('AC-3: sin saldo ni salario pide registrarlos en Cuenta', async () => {
    const l = vi.fn().mockResolvedValue({ settings: { salaryCents: null, account: null }, transactions: [] })
    const res = await call('puedo_comprar', { precio: '80000', plazo: '3' }, vi.fn(), l) as { result: { isError: boolean; content: { text: string }[] } }
    expect(res.result.isError).toBe(true)
    expect(res.result.content[0].text).toMatch(/Cuenta/)
  })
})
