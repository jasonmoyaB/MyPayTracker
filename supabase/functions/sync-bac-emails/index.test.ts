import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Importar index.ts arrancaría Deno.serve: se revisa el código fuente del catch final.
const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8')
const finalCatch = source.slice(source.lastIndexOf('} catch'))

describe('AC-7: la sincronización no filtra detalles internos', () => {
  it('registra el detalle solo en el log', () => {
    expect(finalCatch).toMatch(/console\.error\(/)
  })
  it('responde 500 con un código genérico, sin el mensaje del error', () => {
    expect(finalCatch).toMatch(/Response\.json\(\{ error: 'sync_failed' \}, \{ status: 500 \}\)/)
    expect(finalCatch).not.toMatch(/Response\.json\([^)]*\.message/)
  })
})

describe('ARQ-02jm-T03: lee todos los email_message_id guardados', () => {
  it('pagina con allPages y orden estable', () => {
    expect(source).toMatch(/from '\.\.\/\.\.\/\.\.\/src\/domain\/paging\.ts'/)
    expect(source).toMatch(/allPages\(async \(from, to\)/)
    expect(source).toMatch(/\.order\('id'\)\s*\.range\(from, to\)/)
  })
})

describe('MAIL-02jm-T01: tabla unread_bank_emails', () => {
  const sql = readFileSync(new URL('../../migrations/0019_unread_bank_emails.sql', import.meta.url), 'utf8').toLowerCase()
  it('id del correo como PK, dueño, fecha y si avisa; sin cuerpo del correo', () => {
    expect(sql).toMatch(/create table public\.unread_bank_emails/)
    expect(sql).toMatch(/email_message_id text primary key/)
    expect(sql).toMatch(/user_id uuid not null references auth\.users \(id\) on delete cascade/)
    expect(sql).toMatch(/received_at timestamptz/)
    expect(sql).toMatch(/notify boolean not null/)
    expect(sql).not.toMatch(/body|cuerpo text/)
  })
  it('RLS: el dueño solo lee; escribe únicamente el cron (service_role)', () => {
    expect(sql).toContain('alter table public.unread_bank_emails enable row level security')
    expect(sql).toMatch(/for select to authenticated\s+using \(\(select auth\.uid\(\)\) = user_id\)/)
    expect(sql).not.toMatch(/for (insert|update|delete|all)/)
  })
})

describe('MAIL-02jm-T03: el cron no re-descarga los ilegibles', () => {
  it('known incluye los ids de unread_bank_emails y los ilegibles se guardan con looksLikeMovement', () => {
    expect(source).toMatch(/\.\.\.await unreadIds\(db, env\('OWNER_USER_ID'\)\)/)
    expect(source).toMatch(/notify: looksLikeMovement\(text\)/)
    expect(source).toMatch(/await saveUnread\(db, env\('OWNER_USER_ID'\), unread\)/)
  })
})
