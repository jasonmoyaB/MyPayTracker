import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { AccountView } from './AccountView'

vi.mock('../../data/settings', () => ({ saveAccountBalanceCents: vi.fn(), saveSalaryCents: vi.fn() }))
vi.mock('../../data/auth', () => ({ changePassword: vi.fn(), endExpiredSession: vi.fn() }))

const render = (settings: Parameters<typeof AccountView>[0]['settings'], slot?: string) => renderToStaticMarkup(
  <ToastProvider>
    <AccountView email="yo@correo.com" settings={settings} onSettingsSaved={() => {}}>
      {slot && <p>{slot}</p>}
    </AccountView>
  </ToastProvider>,
)

describe('AC-8: Cuenta', () => {
  it('reúne saldo en BAC, salario y cambiar contraseña', () => {
    const html = render({ salaryCents: 500_000_00, account: { cents: 120_000_00, asOf: '2026-11-01T10:00:00-06:00' } })
    expect(html).toContain(`Saldo actual en BAC: ${formatMoney(120_000_00, 'CRC')}`)
    expect(html).toContain(`Salario: ${formatMoney(500_000_00, 'CRC')}`)
    expect(html).toContain('Cambiar contraseña')
    expect(html.match(/autoComplete="new-password"/g)).toHaveLength(2)
  })
  it('sin datos pide registrarlos y sin onBack no muestra "Volver"', () => {
    const html = render({ salaryCents: null, account: null })
    expect(html).toContain('Registra cuánto tienes hoy en tu cuenta BAC')
    expect(html).toContain('Agrega tu salario para calcular tu saldo.')
    expect(html).not.toContain('Volver')
  })
  it('deja un espacio para notificaciones (PWA-01jm)', () => {
    expect(render({ salaryCents: null, account: null }, 'Interruptor de avisos')).toContain('Interruptor de avisos')
  })
})
