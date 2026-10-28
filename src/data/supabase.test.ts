import { afterEach, describe, expect, it, vi } from 'vitest'

const createClient = vi.hoisted(() => vi.fn(() => ({})))
vi.mock('@supabase/supabase-js', () => ({ createClient }))

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); createClient.mockClear() })

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
