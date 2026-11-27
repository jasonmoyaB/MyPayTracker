import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { BudgetsSection } from './BudgetsSection'

vi.mock('../../data/budgets', () => ({ saveBudget: vi.fn(), deleteBudget: vi.fn() }))

const render = (budgets: Parameters<typeof BudgetsSection>[0]['budgets']) =>
  renderToStaticMarkup(<ToastProvider><BudgetsSection budgets={budgets} onSaved={() => {}} /></ToastProvider>)

describe('PRES-01jm-T04: presupuestos en Opciones', () => {
  it('formulario con categoría y monto en colones', () => {
    const html = render([])
    expect(html).toContain('Presupuestos')
    expect(html).toContain('<option value="Entretenimiento">Entretenimiento</option>')
    expect(html).toContain('Tope mensual en colones')
  })
  it('lista los topes con "Quitar"', () => {
    const html = render([{ category: 'Súper', limitCents: 80_000_00 }])
    expect(html).toContain(`Súper: ${formatMoney(80_000_00, 'CRC')}`)
    expect(html).toContain('Quitar')
  })
})
