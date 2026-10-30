import { supabase } from './supabase'

// MCP-01jm-T04: pantalla de consentimiento del servidor OAuth de Supabase Auth (conector MCP).
// redirectUrl = ya consintió antes: no hay nada que preguntar.
export type Authorization = { clientName: string; scope: string } | { redirectUrl: string }

export async function getAuthorization(id: string): Promise<Authorization> {
  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id)
  if (error) throw error
  return 'redirect_url' in data ? { redirectUrl: data.redirect_url } : { clientName: data.client.name, scope: data.scope }
}

// skipBrowserRedirect: la UI decide cuándo salir de la app (location.href).
async function decide(id: string, approved: boolean): Promise<string> {
  const options = { skipBrowserRedirect: true }
  const { data, error } = approved
    ? await supabase.auth.oauth.approveAuthorization(id, options)
    : await supabase.auth.oauth.denyAuthorization(id, options)
  if (error) throw error
  return data.redirect_url
}

export const approve = (id: string) => decide(id, true)
export const deny = (id: string) => decide(id, false)
