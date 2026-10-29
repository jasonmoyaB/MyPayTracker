import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import css from './theme.css?raw'

// UX-01jm-T01: lee los tokens de theme.css y comprueba contraste AA del texto sobre el vidrio.
type Rgba = [number, number, number, number]

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`falta el bloque ${selector}`)
  const body = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
}

function color(value: string | undefined): Rgba {
  if (!value) throw new Error('token ausente')
  const hex = value.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as Rgba
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4])]
  throw new Error(`color no soportado: ${value}`)
}

// Mezcla un color translúcido sobre un fondo opaco.
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1]
}

function luminance([r, g, b]: Rgba): number {
  const lin = (c: number) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function ratio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const light = block(':root')
const themes = {
  claro: light,
  oscuro: { ...light, ...block(':root[data-theme="dark"]') },
}

describe('AC-2: texto con contraste AA sobre el vidrio', () => {
  for (const [name, t] of Object.entries(themes)) {
    for (const glass of ['--glass-bg', '--glass-bg-strong']) {
      for (const backdrop of ['--color-bg', '--blob-1', '--blob-2', '--blob-3']) {
        for (const text of ['--color-text', '--color-text-secondary']) {
          it(`${name}: ${text} sobre ${glass} encima de ${backdrop} ≥ 4.5`, () => {
            const surface = over(color(t[glass]), color(t[backdrop]))
            expect(ratio(color(t[text]), surface)).toBeGreaterThanOrEqual(4.5)
          })
        }
      }
    }
  }
})

describe('AC-1/AC-3: vidrio en ambos temas y fallback opaco', () => {
  it('el tema oscuro del sistema repite los tokens del oscuro explícito', () => {
    expect(block(':root:not([data-theme="light"])')).toEqual(block(':root[data-theme="dark"]'))
  })
  // PERF-01jm: desenfocar tarjetas altas re-pinta miles de píxeles en cada frame de scroll (36 ms/frame).
  it('las tarjetas no desenfocan y el fondo no es fijo', () => {
    // Declaraciones, no la condición del @supports de abajo.
    expect(css).not.toMatch(/[;{]\s*(-webkit-)?backdrop-filter:/)
    expect(css).not.toMatch(/background-attachment: fixed/)
  })
  it('la navegación sí desenfoca, con prefijo webkit', () => {
    const shell = readFileSync(new URL('./shell.css', import.meta.url), 'utf8')
    expect(shell).toMatch(/-webkit-backdrop-filter: blur\(var\(--glass-blur\)\)/)
    expect(shell).toMatch(/\bbackdrop-filter: blur\(var\(--glass-blur\)\)/)
  })
  it('sin soporte o con menos transparencia vuelven a la superficie opaca', () => {
    expect(css).toContain('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))')
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)')
  })
})
