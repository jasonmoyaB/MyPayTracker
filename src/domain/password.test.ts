import { describe, expect, it } from 'vitest'
import { validatePasswordChange } from './password'

describe('AC-4: validar cambio de contraseña', () => {
  const ok = { current: 'actual123', next: 'nueva1234', confirm: 'nueva1234' }

  it('sin errores cuando todo es válido', () => {
    expect(validatePasswordChange(ok)).toEqual({})
  })

  it.each([
    ['actual vacía', { ...ok, current: '' }, { current: 'Escribe tu contraseña actual.' }],
    ['nueva con menos de 8', { ...ok, next: 'corta12', confirm: 'corta12' }, { next: 'La nueva contraseña debe tener al menos 8 caracteres.' }],
    ['confirmación distinta', { ...ok, confirm: 'otra12345' }, { confirm: 'La confirmación no coincide con la nueva contraseña.' }],
    ['nueva igual a la actual', { ...ok, next: 'actual123', confirm: 'actual123' }, { next: 'La nueva contraseña debe ser distinta de la actual.' }],
    ['todo vacío', { current: '', next: '', confirm: '' }, { current: 'Escribe tu contraseña actual.', next: 'La nueva contraseña debe tener al menos 8 caracteres.' }],
  ])('%s', (_name, input, expected) => {
    expect(validatePasswordChange(input)).toEqual(expected)
  })

  it('8 caracteres exactos es suficiente', () => {
    expect(validatePasswordChange({ ...ok, next: '12345678', confirm: '12345678' })).toEqual({})
  })
})
