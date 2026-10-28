import { describe, expect, it } from 'vitest'

// Reglas de dependencia de la constitución §4: ui → data → domain; domain es puro.
const sources = import.meta.glob<string>(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const forbidden: Record<string, RegExp[]> = {
  domain: [/^react/, /^@supabase\//, /\/(data|ui)\//, /^\.\.\/(data|ui)/],
  data: [/^react/, /\/ui\//, /^\.\.\/ui/],
  ui: [/^@supabase\//],
}

function violations(files: Record<string, string>): string[] {
  const found: string[] = []
  for (const [path, code] of Object.entries(files)) {
    const layer = path.match(/^\.\/(domain|data|ui)\//)?.[1]
    if (!layer) continue
    for (const [, spec] of code.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (forbidden[layer].some((re) => re.test(spec))) found.push(`${path} → ${spec}`)
    }
  }
  return found
}

describe('arquitectura por capas', () => {
  it('AC-2: existen las capas domain, data y ui', () => {
    const layers = new Set(Object.keys(sources).map((p) => p.split('/')[1]))
    expect([...layers]).toEqual(expect.arrayContaining(['domain', 'data', 'ui']))
  })
  it('AC-3: domain no importa React, Supabase, data ni ui', () => {
    expect(violations({ './domain/x.ts': "import { a } from '../data/x'" })).toHaveLength(1)
    expect(violations({ './domain/x.ts': "import React from 'react'" })).toHaveLength(1)
  })
  it('AC-4: ui no importa Supabase directo', () => {
    expect(violations({ './ui/x.tsx': "import { createClient } from '@supabase/supabase-js'" })).toHaveLength(1)
  })
  it('el código real respeta las reglas', () => {
    expect(violations(sources)).toEqual([])
  })
})
