// Costa Rica = UTC−06:00 fijo (sin horario de verano): 21600000 ms = 6 h.
export const CR_OFFSET_MS = 21600000

export function costaRicaDateTime(now: Date): string {
  return new Date(now.getTime() - CR_OFFSET_MS).toISOString().slice(0, 16)
}

export function costaRicaIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null
  const parsed = new Date(`${local}:00Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 16) !== local) return null
  return `${local}:00-06:00`
}
