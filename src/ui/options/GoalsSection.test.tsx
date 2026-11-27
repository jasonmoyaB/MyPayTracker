import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { GoalsSection } from './GoalsSection'

vi.mock('../../data/savings', () => ({ addGoal: vi.fn(), updateGoalSaved: vi.fn(), deleteGoal: vi.fn() }))

const render = (goals: Parameters<typeof GoalsSection>[0]['goals']) =>
  renderToStaticMarkup(<ToastProvider><GoalsSection goals={goals} onSaved={() => {}} /></ToastProvider>)

describe('META-01jm-T04: metas en Opciones', () => {
  it('formulario: nombre, monto, moneda, mes límite y ahorrado', () => {
    const html = render([])
    for (const text of ['Metas de ahorro', 'Nombre', 'Monto objetivo', '<option value="USD">', 'type="month"', 'Ahorrado hasta hoy', 'Crear meta']) {
      expect(html).toContain(text)
    }
  })
  it('lista cada meta con "Actualizar ahorrado" y "Borrar"', () => {
    const html = render([{ id: 'g', name: 'Viaje', targetCents: 1_500_00, currency: 'USD', deadline: '2027-03', savedCents: 200_00 }])
    expect(html).toContain(`Viaje: ${formatMoney(200_00, 'USD')} de ${formatMoney(1_500_00, 'USD')}`)
    expect(html).toContain('Actualizar ahorrado')
    expect(html).toContain('Borrar')
  })
})
