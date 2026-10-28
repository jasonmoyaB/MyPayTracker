import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// UX-01jm-T02: iconos derivados del símbolo y originales fuera de public/.
function pngSize(file: string): [number, number] {
  const png = readFileSync(new URL(`../../public/icons/${file}`, import.meta.url))
  return [png.readUInt32BE(16), png.readUInt32BE(20)]
}

describe('AC-4: iconos del símbolo', () => {
  it.each([['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]])(
    '%s mide %i px', (file, size) => expect(pngSize(file)).toEqual([size, size]),
  )
})

describe('AC-5: no se publican los originales pesados', () => {
  it('public/ solo tiene archivos ligeros', () => {
    const top = readdirSync(new URL('../../public/', import.meta.url))
    expect(top.filter((f) => f.endsWith('.png'))).toEqual([])
  })
  it('el logo reducido mide ~640 px de ancho', () => {
    expect(pngSize('logo.png')[0]).toBe(640)
  })
  it('los originales se conservan en docs/design/marca/', () => {
    expect(existsSync(new URL('../../docs/design/marca/', import.meta.url))).toBe(true)
  })
})
