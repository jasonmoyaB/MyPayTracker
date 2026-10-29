import { useEffect, useRef, useState } from 'react'
import { listReminders, type Reminder } from '../../data/reminders'
import type { Transaction } from '../../data/transactions'
import { costaRicaDateTime } from '../../domain/date'
import { dueOn, nextPayDay } from '../../domain/credit'
import { dueSoon, nextDueOn } from '../../domain/reminder'
import { BELL_ICON } from '../AppShell'
import { outsideRect } from '../dashboard/CreditCard'
import { formatMoney } from '../format'
import '../dashboard/dashboard.css'

// REC-01jm-T10: lo que vence en 0–3 días, de los recordatorios y de la tarjeta (CRC y USD aparte, nunca sumados).
export function bellItems(reminders: Reminder[], transactions: Transaction[], now: Date) {
  const items = reminders.flatMap((r) => {
    const when = dueSoon(nextDueOn(r.day, now), now)
    return when ? [{ key: r.id, text: `${r.description}: ${when}, ${formatMoney(r.amountCents, r.currency)}` }] : []
  })
  const payDay = nextPayDay(now)
  const card = dueOn(transactions, payDay)
  const when = dueSoon(costaRicaDateTime(new Date(payDay)).slice(0, 10), now)
  const money = [card.crcCents > 0 && formatMoney(card.crcCents, 'CRC'), card.usdCents > 0 && formatMoney(card.usdCents, 'USD')].filter(Boolean)
  if (when && money.length > 0) items.push({ key: 'tarjeta', text: `Tarjeta de crédito: ${when}, ${money.join(' y ')}` })
  return items
}

type Props = { transactions: Transaction[]; now?: Date; initial?: Reminder[] }

// Se calcula al abrir la app; no guarda historial de pushes. `initial` solo existe para probar sin DOM.
export function NotificationBell({ transactions, now = new Date(), initial }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [reminders, setReminders] = useState<Reminder[]>(initial ?? [])
  // ponytail: si falla (p. ej. falta 0010) la campana muestra solo la tarjeta; el error lo explica la pantalla Recordatorios.
  useEffect(() => { if (!initial) listReminders().then(setReminders, () => {}) }, [initial])
  const items = bellItems(reminders, transactions, now)
  return (
    <>
      <button type="button" className="secondary bell" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog"
        aria-label={`Notificaciones: ${items.length > 0 ? `${items.length} por pagar` : 'nada por pagar'}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={BELL_ICON} /></svg>
        {items.length > 0 && <span className="bell-count" aria-hidden="true">{items.length}</span>}
      </button>
      <dialog ref={dialog} aria-label="Notificaciones" className="dashboard-dialog"
        onClick={e => { if (e.target === e.currentTarget && outsideRect(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY)) e.currentTarget.close() }}>
        <h3 style={{ margin: 0 }}>Notificaciones</h3>
        {items.length === 0 ? <p className="muted" style={{ margin: 0 }}>Nada por pagar en los próximos 3 días.</p> : (
          <ul className="dashboard-list">{items.map((i) => <li key={i.key}>{i.text}</li>)}</ul>
        )}
        <a href="#/recordatorios" onClick={() => dialog.current?.close()}>Ver recordatorios</a>
        <form method="dialog"><button type="submit">Cerrar</button></form>
      </dialog>
    </>
  )
}
