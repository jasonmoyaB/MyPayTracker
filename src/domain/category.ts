// CAT-01jm-T02: con extensión porque la Edge Function (Deno) lo importa vía budget.ts (PRES-01jm).
import type { Direction } from './balance.ts'

// Misma lista y texto que el check de 0016.
export const CATEGORIES = ['Súper', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Compras', 'Entretenimiento', 'Otros'] as const
export type Category = (typeof CATEGORIES)[number]

export type CategoryMovement = { description: string; direction: Direction; occurredAt: string; category?: Category | null }

// ponytail: palabras fijas; si fallan mucho, el dev corrige a mano y el historial (paso 2) aprende.
const KEYWORDS: [Category, string[]][] = [
  ['Súper', ['auto mercado', 'automercado', 'walmart', 'mas x menos', 'masxmenos', 'pali', 'pricesmart', 'perimercados']],
  ['Transporte', ['uber', 'didi', 'gasolinera', 'servicentro', 'peaje']],
  ['Comida', ['restaurante', 'soda', 'pizza', 'mcdonalds', 'kfc', 'starbucks']],
  ['Servicios', ['ice', 'kolbi', 'cnfl', 'aya', 'tigo', 'claro', 'liberty', 'netflix', 'spotify']],
  ['Salud', ['farmacia', 'fischel', 'clinica', 'hospital']],
  ['Entretenimiento', ['cine', 'steam', 'playstation']],
]

// Sin mayúsculas, tildes, apóstrofos ni espacios extra; con espacios en los bordes para buscar palabras completas
// ("servicentro" no debe caer en Servicios por contener "ice").
// ALR-01jm-T01: también decide "mismo comercio" en unusual.ts.
export const normalize = (text: string) =>
  ` ${text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `

const byKeywords = (description: string): Category => {
  const text = normalize(description)
  return KEYWORDS.find(([, words]) => words.some((w) => text.includes(` ${w} `)))?.[0] ?? 'Otros'
}

// Orden del spec: (1) la puesta a mano; (2) la última puesta a mano a la misma descripción; (3) palabras; (4) Otros.
// Ingresos sin categoría. Pura y sin I/O: la usan Movimientos, presupuestos (PRES-01jm) y el cron.
export function categorize(all: CategoryMovement[]): (m: CategoryMovement) => Category | null {
  const last = new Map<string, { category: Category; at: number }>()
  for (const m of all) {
    if (m.direction !== 'out' || !m.category) continue
    const key = normalize(m.description)
    const at = Date.parse(m.occurredAt)
    if ((last.get(key)?.at ?? -Infinity) < at) last.set(key, { category: m.category, at })
  }
  return (m) => m.direction === 'in' ? null : m.category ?? last.get(normalize(m.description))?.category ?? byKeywords(m.description)
}
