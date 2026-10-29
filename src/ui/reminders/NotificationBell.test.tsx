import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../../data/transactions'
import { formatMoney } from '../format'
import { bellItems, NotificationBell } from './NotificationBell'

vi.mock('../../data/reminders', () => ({ listReminders: vi.fn(() => new Promise(() => {})) }))

const now = new Date('2026-11-18T09:00:00-06:00')
const spotify = { id: 'r1', description: 'Spotify', amountCents: 2000_00, currency: 'CRC' as const, day: 19 }
const netflix = { id: 'r2', description: 'Netflix', amountCents: 5_00, currency: 'USD' as const, day: 28 }
const tele: Transaction = { id: 't', amountCents: 30_000_00, currency: 'CRC', direction: 'out', source: 'manual', description: 'tele',
  occurredAt: '2026-10-25T12:00:00-06:00', paymentMethod: 'credit', installments: 1 }

describe('REC-01jm-T10: campana de notificaciones', () => {
  it('junta recordatorios y tarjeta que vencen en 0–3 días; lo lejano no sale', () => {
    expect(bellItems([spotify, netflix], [tele], now).map(i => i.text)).toEqual([
      `Spotify: vence mañana, ${formatMoney(2000_00, 'CRC')}`, `Tarjeta de crédito: vence en 2 días, ${formatMoney(30_000_00, 'CRC')}`])
  })
  it('la campana muestra la cantidad y abre un dialog que lleva a Recordatorios', () => {
    const html = renderToStaticMarkup(<NotificationBell transactions={[tele]} now={now} initial={[spotify]} />)
    expect(html).toContain('aria-label="Notificaciones: 2 por pagar"')
    expect(html).toMatch(/<dialog[^>]*>.*Spotify: vence mañana.*href="#\/recordatorios"/)
  })
  it('sin nada por vencer lo dice y no muestra cantidad', () => {
    const html = renderToStaticMarkup(<NotificationBell transactions={[]} now={now} initial={[]} />)
    expect(html).toContain('aria-label="Notificaciones: nada por pagar"')
    expect(html).toContain('Nada por pagar en los próximos 3 días.')
  })
})
