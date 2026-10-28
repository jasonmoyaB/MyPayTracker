import { describe, expect, it, vi } from 'vitest'
import { saveWithToast } from './saveWithToast'

vi.mock('../../data/auth', () => ({ endExpiredSession: vi.fn(() => Promise.resolve()) }))

const fakeToast = () => ({ success: vi.fn(), error: vi.fn() })

describe('AC-1/AC-2: guardar con aviso', () => {
  it('éxito: muestra el mensaje de éxito y no devuelve error', async () => {
    const toast = fakeToast()
    const result = await saveWithToast(() => Promise.resolve(), toast, 'Saldo actualizado')
    expect(result).toBeNull()
    expect(toast.success).toHaveBeenCalledWith('Saldo actualizado')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('fallo: toast de error amigable, sin texto técnico, y devuelve el tipo', async () => {
    const toast = fakeToast()
    const result = await saveWithToast(() => Promise.reject(new TypeError('Failed to fetch')), toast, 'Salario actualizado')
    expect(result?.kind).toBe('offline')
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(result?.message)
    expect(toast.error.mock.calls[0][0]).not.toMatch(/fetch/i)
  })
})
