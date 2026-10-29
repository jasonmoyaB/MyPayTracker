import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { showScreenTop } from './route'
import { AccountView } from './account/AccountView'
import { DashboardView } from './dashboard/DashboardView'
import { ToastProvider } from './toast/ToastProvider'
import { TransactionsPanel } from './transactions/TransactionsPanel'

vi.mock('../data/settings', () => ({ saveAccountBalanceCents: vi.fn(), saveSalaryCents: vi.fn() }))
vi.mock('../data/auth', () => ({ changePassword: vi.fn(), endExpiredSession: vi.fn() }))
vi.mock('../data/transactions', () => ({ addManualTransaction: vi.fn() }))

// DASH-01jm-T06: correcciones de revisión.
describe('AC-1: al cambiar de sección', () => {
  it('sube al inicio y enfoca el primer h2 sin volver a desplazar', () => {
    const focus = vi.fn()
    const scrollTo = vi.fn()
    showScreenTop({ querySelector: () => ({ focus }) as unknown as HTMLElement }, scrollTo)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })
  it('sin h2 (cargando) solo sube', () => {
    const scrollTo = vi.fn()
    showScreenTop({ querySelector: () => null }, scrollTo)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  const firstH2 = (html: string) => html.match(/<h2[^>]*>/)?.[0]
  const settings = { salaryCents: null, account: null }
  it.each([
    ['Resumen', <DashboardView settings={settings} transactions={[]} />],
    ['Movimientos', <TransactionsPanel transactions={[]} filter={{ from: null, to: null, direction: 'all' }}
      onFilterChange={() => {}} onTransactionSaved={() => {}} />],
    ['Cuenta', <ToastProvider><AccountView settings={settings} onSettingsSaved={() => {}} /></ToastProvider>],
  ])('el primer h2 de %s es enfocable por código (tabindex -1)', (_, screen) => {
    expect(firstH2(renderToStaticMarkup(screen))).toContain('tabindex="-1"')
  })
})

describe('avisos en móvil', () => {
  it('la regla de .toasts sobre la barra no depende del orden de los CSS', () => {
    // Vitest vacía los .css importados; se lee del disco.
    const shellCss = readFileSync(new URL('./shell.css', import.meta.url), 'utf8')
    expect(shellCss).toMatch(/\.app-shell\s*~\s*\.toasts\s*\{/)
  })
})

describe('AC-2: saldo negativo', () => {
  it('aviso neutro, válido con saldo de cuenta o salario', () => {
    const html = renderToStaticMarkup(<DashboardView settings={{ salaryCents: 0, account: null }}
      transactions={[{ id: '1', occurredAt: '2026-11-01T10:00:00-06:00', amountCents: 100, direction: 'out',
        description: 'x', currency: 'CRC', source: 'manual', paymentMethod: 'cash', installments: 1 }]} />)
    expect(html).toContain('tus gastos superan tu saldo')
    expect(html).not.toContain('salario más tus ingresos')
  })
})
