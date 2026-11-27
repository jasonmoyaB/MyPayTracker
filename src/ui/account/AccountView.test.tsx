import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { AccountView } from './AccountView'

vi.mock('../../data/settings', () => ({ saveAccountBalanceCents: vi.fn(), saveSalaryCents: vi.fn(), saveUsdRateCents: vi.fn() }))
vi.mock('../../data/auth', () => ({ changePassword: vi.fn(), endExpiredSession: vi.fn() }))
vi.mock('../../data/push', () => ({ saveSubscription: vi.fn(), deleteSubscription: vi.fn() }))

const render = (settings: Parameters<typeof AccountView>[0]['settings'], transactions: Parameters<typeof AccountView>[0]['transactions'] = []) => renderToStaticMarkup(
  <ToastProvider>
    <AccountView settings={settings} transactions={transactions} onSettingsSaved={() => {}} />
  </ToastProvider>,
)

describe('AC-8: Cuenta', () => {
  it('reúne saldo en BAC y salario; cambiar contraseña está en Opciones (NAV-02jm)', () => {
    const html = render({ salaryCents: 500_000_00, account: { cents: 120_000_00, asOf: '2026-11-01T10:00:00-06:00' } })
    expect(html).toContain(`Saldo actual en BAC: ${formatMoney(120_000_00, 'CRC')}`)
    expect(html).toContain(`Salario: ${formatMoney(500_000_00, 'CRC')}`)
    expect(html).not.toContain('Cambiar contraseña')
  })
  it('sin datos pide registrarlos y sin onBack no muestra "Volver"', () => {
    const html = render({ salaryCents: null, account: null })
    expect(html).toContain('Registra cuánto tienes hoy en tu cuenta BAC')
    expect(html).toContain('Agrega tu salario para calcular tu saldo.')
    expect(html).not.toContain('Volver')
  })
  it('las notificaciones viven en Opciones (UX-03jm)', () => {
    expect(render({ salaryCents: null, account: null })).not.toContain('Notificaciones')
  })
})

describe('BAL-02jm-T02: cuadre en Cuenta', () => {
  it('muestra lo que calcula la app hoy (saldo + movimientos posteriores)', () => {
    const tx = { id: 't1', amountCents: 1_000_00, currency: 'CRC' as const, direction: 'out' as const, description: 'X', occurredAt: '2026-11-02T10:00:00-06:00', source: 'manual' as const, paymentMethod: 'cash' as const, installments: 1 }
    const html = render({ salaryCents: null, account: { cents: 120_000_00, asOf: '2026-11-01T10:00:00-06:00' } }, [tx])
    expect(html).toContain(`La app calcula hoy: ${formatMoney(119_000_00, 'CRC')}`)
  })
  it('AC-4: sin saldo ni salario no muestra la cifra de la app', () => {
    expect(render({ salaryCents: null, account: null })).not.toContain('La app calcula hoy')
  })
})

describe('USD-01jm-T03: tipo de cambio en Cuenta', () => {
  it('pide el tipo si no hay y lo muestra si está guardado', () => {
    expect(render({ salaryCents: null, account: null })).toContain('registra cuántos colones vale un dólar')
    expect(render({ salaryCents: null, account: null, usdRateCents: 505_32 })).toContain(`Tipo de cambio: ${formatMoney(505_32, 'CRC')}`)
  })
})
