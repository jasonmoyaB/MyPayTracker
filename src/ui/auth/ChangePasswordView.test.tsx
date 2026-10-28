import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm, submitPasswordChange } from './ChangePasswordView'

const endExpiredSession = vi.hoisted(() => vi.fn())
vi.mock('../../data/auth', () => ({ changePassword: vi.fn(), endExpiredSession }))

const values = { current: 'actual123', next: 'nueva1234', confirm: 'nueva1234' }
const toast = { success: vi.fn(), error: vi.fn() }
beforeEach(() => { toast.success.mockReset(); toast.error.mockReset() })

const form = (props: Partial<Parameters<typeof ChangePasswordForm>[0]> = {}) => renderToStaticMarkup(
  <ChangePasswordForm values={values} errors={{}} pending={false} onChange={() => {}} onSubmit={() => {}} onBack={() => {}} {...props} />,
)

describe('AC-2: los tres campos tienen ojo', () => {
  it('actual, nueva y confirmación con su autocomplete', () => {
    const markup = form()
    expect(markup.match(/aria-label="Mostrar contraseña"/g)).toHaveLength(3)
    expect(markup.match(/autoComplete="current-password"/g)).toHaveLength(1)
    expect(markup.match(/autoComplete="new-password"/g)).toHaveLength(2)
    expect(markup).toContain('Volver')
  })
})

describe('AC-4: errores junto a su campo', () => {
  it('cada error se enlaza con aria-describedby', () => {
    const markup = form({ errors: { next: 'Muy corta.', confirm: 'No coincide.' } })
    expect(markup).toMatch(/<input[^>]*aria-describedby="cp-next-error"/)
    expect(markup).toContain('<p id="cp-next-error" role="alert" class="status-danger">Muy corta.</p>')
    expect(markup).toContain('id="cp-confirm-error"')
    expect(markup).not.toContain('cp-current-error')
  })

  it('con errores de validación no llama al servidor', async () => {
    const change = vi.fn()
    const result = await submitPasswordChange({ ...values, confirm: 'otra' }, 'yo@correo.com', change, toast)
    expect(result.ok).toBe(false)
    expect(result.errors.confirm).toBeDefined()
    expect(change).not.toHaveBeenCalled()
  })
})

describe('AC-3: contraseña actual incorrecta', () => {
  it('se avisa junto al campo actual, sin toast', async () => {
    const change = vi.fn().mockRejectedValue({ code: 'invalid_credentials', message: 'Invalid login credentials' })
    const result = await submitPasswordChange(values, 'yo@correo.com', change, toast)
    expect(result).toEqual({ ok: false, errors: { current: 'La contraseña actual no es correcta.' } })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('otros fallos van al toast', async () => {
    const change = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const result = await submitPasswordChange(values, 'yo@correo.com', change, toast)
    expect(result).toEqual({ ok: false, errors: {} })
    expect(toast.error).toHaveBeenCalledWith('Sin conexión. Revisa tu internet e intenta de nuevo.')
  })
})

describe('AC-5: éxito', () => {
  it('cambia con el correo de la sesión y muestra "Contraseña actualizada"', async () => {
    const change = vi.fn().mockResolvedValue(undefined)
    const result = await submitPasswordChange(values, 'yo@correo.com', change, toast)
    expect(change).toHaveBeenCalledWith('yo@correo.com', 'actual123', 'nueva1234')
    expect(result.ok).toBe(true)
    expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada')
  })
})

describe('AC-6: mientras se guarda', () => {
  it('el botón queda deshabilitado', () => {
    expect(form({ pending: true })).toMatch(/<button type="submit" disabled="">Guardando…<\/button>/)
  })
})
