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
    <DashboardBody route="resumen" email="yo@correo.com" data={data} error={null} reload={() => {}} {...props} />
  </ToastProvider>,
)

describe('AC-1: cada sección muestra su pantalla', () => {
  it('Resumen', () => expect(render({ route: 'resumen' })).toContain('Últimos movimientos'))
  it('Movimientos', () => expect(render({ route: 'movimientos' })).toContain('Registrar movimiento'))
  it('Cuenta', () => {
    const html = render({ route: 'cuenta' })
    expect(html).toContain('Saldo y salario')
    expect(html).toContain('Cambiar contraseña')
  })
  it('un error de carga se muestra sobre los datos con "Reintentar"', () => {
    const html = render({ error: 'Sin conexión.' })
    expect(html).toContain('Reintentar')
    expect(html).toContain('Últimos movimientos')
  })
  it('sin datos todavía: cargando', () => expect(render({ data: null })).toContain('Cargando movimientos…'))
})
