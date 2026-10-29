import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../../data/transactions'
import { formatMoney } from '../format'
import { ToastProvider } from '../toast/ToastProvider'
import { checkReminder } from './ReminderForm'
import { RemindersList, RemindersView } from './RemindersView'

vi.mock('../../data/reminders', () => ({ addReminder: vi.fn(), deleteReminder: vi.fn(), listReminders: vi.fn() }))

const now = new Date('2026-10-29T12:00:00-06:00')
const credit = (occurredAt: string, amountCents: number, currency: 'CRC' | 'USD' = 'CRC'): Transaction => ({ id: occurredAt, amountCents,
  currency, direction: 'out', source: 'manual', description: 'x', occurredAt, paymentMethod: 'credit', installments: 1 })
const render = (transactions: Transaction[] = [], reminders = [{ id: 'r1', description: 'Spotify', amountCents: 2000_00, currency: 'CRC' as const, day: 15 }]) =>
  renderToStaticMarkup(<ToastProvider><RemindersList reminders={reminders} transactions={transactions} reload={() => {}} now={now} /></ToastProvider>)

describe('REC-01jm-T04: pantalla Recordatorios', () => {
  it('AC-1: cada recordatorio con su próxima fecha, monto y botón Borrar', () => {
    const html = render()
    expect(html).toMatch(/<ul class="dashboard-list"[^>]*>.*Spotify.*15 nov.*₡2.000,00.*Borrar/)
  })
  it('AC-4: arriba el pago de la tarjeta con lo que vence ese 20; USD aparte', () => {
    const html = render([credit('2026-10-10T12:00:00-06:00', 10_000_00), credit('2026-10-11T12:00:00-06:00', 20_666_70),
      credit('2026-10-12T12:00:00-06:00', 15_00, 'USD')])
    expect(html).toMatch(/Tarjeta de crédito.*20 nov/)
    expect(html).toContain(`${formatMoney(30_666_70, 'CRC')} y ${formatMoney(15_00, 'USD')}`)
  })
  it('sin deuda que venza ese 20, no aparece la tarjeta', () => {
    expect(render()).not.toContain('Tarjeta de crédito')
  })
  it('sin recordatorios lo dice, y siempre ofrece el formulario', () => {
    const html = render([], [])
    expect(html).toContain('Aún no tienes recordatorios')
    for (const t of ['Agregar recordatorio', 'Descripción', 'Monto', 'Moneda', 'Día del mes']) expect(html).toContain(t)
  })
})

describe('REC-01jm-T04: validación del formulario', () => {
  it('monto en centavos, descripción recortada, día 1–31', () => {
    expect(checkReminder({ description: ' Spotify ', amount: '2000', currency: 'CRC', day: '15' }))
      .toEqual({ description: 'Spotify', amountCents: 2000_00, currency: 'CRC', day: 15 })
  })
  it('rechaza descripción vacía, monto inválido y día fuera de rango', () => {
    expect(checkReminder({ description: ' ', amount: '2000', currency: 'CRC', day: '15' })).toHaveProperty('error')
    expect(checkReminder({ description: 'x', amount: '0', currency: 'CRC', day: '15' })).toHaveProperty('error')
    for (const day of ['0', '32', '1.5', '']) expect(checkReminder({ description: 'x', amount: '1', currency: 'USD', day })).toHaveProperty('error')
  })
})

describe('REC-01jm-T06: correcciones de review', () => {
  const view = (state: Parameters<typeof RemindersView>[0]['initial']) =>
    renderToStaticMarkup(<ToastProvider><RemindersView transactions={[]} initial={state} /></ToastProvider>)
  it('carga sus recordatorios en la propia pantalla, con el h2 enfocable', () => {
    expect(view(undefined)).toMatch(/<h2[^>]*tabindex="-1"[^>]*>Recordatorios<\/h2>.*Cargando recordatorios…/)
  })
  it('si falla (p. ej. falta 0010), solo esta pantalla muestra el error con Reintentar', () => {
    const html = view({ reminders: null, error: 'Sin conexión.' })
    expect(html).toMatch(/role="alert".*No pudimos cargar tus recordatorios\. Sin conexión\..*Reintentar/)
    expect(html).not.toContain('Agregar recordatorio')
  })
  it('Borrar va en un botón deshabilitable y la descripción tiene tope de 60', () => {
    const html = render()
    expect(html).toMatch(/<button type="button" class="secondary"[^>]*>Borrar<\/button>/)
    expect(html).toMatch(/<input id="reminder-description" maxLength="60"/)
  })
})
