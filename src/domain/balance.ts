export type Direction = 'in' | 'out'

export type Movement = { amountCents: number; direction: Direction }

export function availableBalance(salaryCents: number, movements: Movement[]): number {
  return movements.reduce(
    (total, m) => (m.direction === 'in' ? total + m.amountCents : total - m.amountCents),
    salaryCents,
  )
}

export function canAfford(salaryCents: number, movements: Movement[], priceCents: number): boolean {
  return availableBalance(salaryCents, movements) >= priceCents
}
