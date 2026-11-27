// ARQ-02jm-T01: PostgREST corta en 1000 filas; se piden rangos [from, to] hasta que una página venga incompleta.
export async function allPages<T>(fetchPage: (from: number, to: number) => Promise<T[]>, size = 1000): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += size) {
    const page = await fetchPage(from, from + size - 1)
    all.push(...page)
    if (page.length < size) return all
  }
}
