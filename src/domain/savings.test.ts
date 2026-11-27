import { describe, expect, it } from 'vitest'
import { goalStatus, type SavingsGoal } from './savings'

const now = new Date('2026-11-27T12:00:00-06:00')
const goal = (extra: Partial<SavingsGoal> = {}): SavingsGoal =>
  ({ id: '1', name: 'Diciembre', targetCents: 500_000_00, currency: 'CRC', deadline: '2026-12', savedCents: 100_000_00, ...extra })

describe('META-01jm-T02: goalStatus', () => {
  it('AC-1: faltan ₡400 000 en 2 meses (nov y dic) → ₡200 000 al mes', () => {
    expect(goalStatus(goal(), now)).toEqual({ kind: 'saving', monthlyCents: 200_000_00, months: 2 })
  })
  it('AC-2: redondea hacia arriba al céntimo', () => {
    expect(goalStatus(goal({ targetCents: 100_000_00, savedCents: 0, deadline: '2027-01' }), now))
      .toEqual({ kind: 'saving', monthlyCents: 33_333_34, months: 3 })
  })
  it('AC-3: ahorrado ≥ objetivo → cumplida (aunque haya vencido)', () => {
    expect(goalStatus(goal({ savedCents: 500_000_00 }), now)).toEqual({ kind: 'done' })
    expect(goalStatus(goal({ savedCents: 600_000_00, deadline: '2026-01' }), now)).toEqual({ kind: 'done' })
  })
  it('AC-4: límite oct y hoy nov sin llegar → vencida con lo que falta', () => {
    expect(goalStatus(goal({ deadline: '2026-10' }), now)).toEqual({ kind: 'overdue', missingCents: 400_000_00 })
  })
  it('el mes en curso usa la hora CR: 1 dic 00:30 UTC todavía es 30 nov en CR', () => {
    expect(goalStatus(goal(), new Date('2026-12-01T00:30:00Z'))).toMatchObject({ months: 2 })
  })
})
