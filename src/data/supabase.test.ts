import { afterEach, describe, expect, it, vi } from 'vitest'

const createClient = vi.hoisted(() => vi.fn(() => ({})))
vi.mock('@supabase/supabase-js', () => ({ createClient }))

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); createClient.mockClear() })

describe('AC-6: variables de Supabase faltantes', () => {
  it('no lanza al importar y expone configError', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    const mod = await import('./supabase')
    expect(mod.configError).toMatch(/VITE_SUPABASE_URL/)
  })
  it('sin config el cliente no refresca ni guarda sesión (no llama a valores de relleno)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    await import('./supabase')
    expect(createClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  })
  it('con variables no hay configError', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_demo')
    expect((await import('./supabase')).configError).toBeNull()
  })
})

describe('AUTH-02jm: la sesión no sobrevive a cerrar la app', () => {
  it('AC-1: el cliente guarda la sesión en sessionStorage', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_demo')
    const session = { getItem: vi.fn() }
    vi.stubGlobal('sessionStorage', session)
    await import('./supabase')
    expect(createClient).toHaveBeenCalledWith('https://demo.supabase.co', 'sb_publishable_demo', { auth: { storage: session } })
  })
  it('AC-2: al cargar borra de localStorage la sesión vieja (sb-*) y nada más', async () => {
    const local = { 'sb-demo-auth-token': 'x', tema: 'oscuro', removeItem(k: string) { delete (this as Record<string, unknown>)[k] } }
    vi.stubGlobal('localStorage', local)
    await import('./supabase')
    expect(Object.keys(local)).toEqual(['tema', 'removeItem'])
  })
})
