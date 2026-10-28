import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

describe('AC-6: variables de Supabase faltantes', () => {
  it('no lanza al importar y expone configError', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    const mod = await import('./supabase')
    expect(mod.configError).toMatch(/VITE_SUPABASE_URL/)
  })
  it('con variables no hay configError', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_demo')
    expect((await import('./supabase')).configError).toBeNull()
  })
})
