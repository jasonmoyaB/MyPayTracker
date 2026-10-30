import { beforeEach, describe, expect, it, vi } from 'vitest'
import { approve, deny, getAuthorization } from './oauth'

const oauth = vi.hoisted(() => ({ getAuthorizationDetails: vi.fn(), approveAuthorization: vi.fn(), denyAuthorization: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { auth: { oauth } } }))

const redirect = { data: { redirect_url: 'https://claude.ai/cb?code=x' }, error: null }
beforeEach(() => {
  oauth.approveAuthorization.mockReset().mockResolvedValue(redirect)
  oauth.denyAuthorization.mockReset().mockResolvedValue(redirect)
})

describe('MCP-01jm-T04: consentimiento OAuth', () => {
  it('devuelve el nombre del cliente y los scopes cuando falta consentir', async () => {
    oauth.getAuthorizationDetails.mockResolvedValue({ data: {
      authorization_id: 'a1', redirect_uri: 'https://claude.ai/cb', scope: 'openid email',
      client: { id: 'c', name: 'Claude', uri: '', logo_uri: '' }, user: { id: 'u', email: 'yo@x.com' },
    }, error: null })
    expect(await getAuthorization('a1')).toEqual({ clientName: 'Claude', scope: 'openid email' })
    expect(oauth.getAuthorizationDetails).toHaveBeenCalledWith('a1')
  })
  it('si ya consintió antes, devuelve directo la URL de vuelta', async () => {
    oauth.getAuthorizationDetails.mockResolvedValue(redirect)
    expect(await getAuthorization('a1')).toEqual({ redirectUrl: 'https://claude.ai/cb?code=x' })
  })
  it('aprobar y rechazar devuelven la URL de vuelta sin redirigir solos', async () => {
    expect(await approve('a1')).toBe('https://claude.ai/cb?code=x')
    expect(await deny('a1')).toBe('https://claude.ai/cb?code=x')
    expect(oauth.approveAuthorization).toHaveBeenCalledWith('a1', { skipBrowserRedirect: true })
    expect(oauth.denyAuthorization).toHaveBeenCalledWith('a1', { skipBrowserRedirect: true })
  })
  it('propaga los errores de Supabase', async () => {
    const error = { code: 'oauth_authorization_not_found', message: 'not found', status: 404 }
    oauth.getAuthorizationDetails.mockResolvedValue({ data: null, error })
    oauth.approveAuthorization.mockResolvedValue({ data: null, error })
    await expect(getAuthorization('a1')).rejects.toBe(error)
    await expect(approve('a1')).rejects.toBe(error)
  })
})
