import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { DashboardBody } from './App'
import { ToastProvider } from './toast/ToastProvider'

vi.mock('../data/auth', () => ({ onSessionChange: vi.fn(), signOut: vi.fn(), changePassword: vi.fn(), endExpiredSession: vi.fn() }))
vi.mock('../data/settings', () => ({ getSettings: vi.fn(), saveAccountBalanceCents: vi.fn(), saveSalaryCents: vi.fn() }))
vi.mock('../data/transactions', () => ({ listTransactions: vi.fn(), addManualTransaction: vi.fn() }))

const data = { settings: { salaryCents: 100_00, account: null }, transactions: [] }
const render = (props: Partial<Parameters<typeof DashboardBody>[0]>) => renderToStaticMarkup(
  <ToastProvider>
    <DashboardBody route="resumen" email="yo@correo.com" data={data} error={null} reload={() => {}}
      filter={{ from: null, to: null, direction: 'all' }} onFilterChange={() => {}} {...props} />
  </ToastProvider>,
)

describe('AC-1: cada sección muestra su pantalla', () => {
  it('Resumen', () => expect(render({ route: 'resumen' })).toContain('Últimos movimientos'))
  it('Movimientos', () => expect(render({ route: 'movimientos' })).toContain('Registrar movimiento'))
  it('Cuenta', () => {
    const html = render({ route: 'cuenta' })
    expect(html).toContain('Saldo y salario')
    expect(html).not.toContain('Cambiar contraseña')
  })
  it('Opciones (NAV-02jm)', () => {
    vi.stubGlobal('document', { documentElement: { dataset: {} } })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const html = render({ route: 'opciones' })
    vi.unstubAllGlobals()
    expect(html).toContain('Cambiar contraseña')
    expect(html).toContain('Cerrar sesión')
  })
  it('un error de carga se muestra sobre los datos con "Reintentar"', () => {
    const html = render({ error: 'Sin conexión.' })
    expect(html).toContain('Reintentar')
    expect(html).toContain('Últimos movimientos')
  })
  it('sin datos todavía: cargando', () => expect(render({ data: null })).toContain('Cargando movimientos…'))
})

describe('MOV-01jm: el filtro vive en el shell', () => {
  const gasto = { id: '1', amountCents: 500, currency: 'CRC' as const, direction: 'out' as const, source: 'manual' as const,
    description: 'Café', occurredAt: '2026-10-28T13:45:00-06:00', paymentMethod: 'cash' as const }
  const withGasto = { ...data, transactions: [gasto] }
  const onlyIncome = { from: null, to: null, direction: 'in' as const }
  it('AC-8: Movimientos muestra el filtro que recibe de App', () => {
    expect(render({ route: 'movimientos', data: withGasto, filter: onlyIncome })).toContain('No hay movimientos con estos filtros')
  })
  it('AC-7: el Resumen usa la lista completa, no la filtrada', () => {
    expect(render({ route: 'resumen', data: withGasto, filter: onlyIncome })).toContain('Café')
  })
})
