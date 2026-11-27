import { describe, expect, it, vi } from 'vitest'
import { allPages } from './paging.ts'

// Simula PostgREST: devuelve filas [from, to] de una tabla de `total` filas.
function table(total: number) {
  const rows = Array.from({ length: total }, (_, i) => i)
  return vi.fn(async (from: number, to: number) => rows.slice(from, to + 1))
}

describe('ARQ-02jm-T01: allPages', () => {
  it('AC-1: 2 500 filas en 3 páginas, sin repetir ni saltar', async () => {
    const fetchPage = table(2500)
    const all = await allPages(fetchPage)
    expect(all).toEqual(Array.from({ length: 2500 }, (_, i) => i))
    expect(fetchPage.mock.calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]])
  })
  it('AC-2: 0 filas, 1 consulta y lista vacía', async () => {
    const fetchPage = table(0)
    expect(await allPages(fetchPage)).toEqual([])
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })
  it('AC-3: exactamente 1000, la segunda consulta vuelve vacía y termina', async () => {
    const fetchPage = table(1000)
    expect(await allPages(fetchPage)).toHaveLength(1000)
    expect(fetchPage.mock.calls).toEqual([[0, 999], [1000, 1999]])
  })
})
