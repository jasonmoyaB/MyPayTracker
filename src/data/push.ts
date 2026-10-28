import { supabase } from './supabase'

// PWA-01jm-T04: suscripción push de este dispositivo. Recibe `PushSubscription.toJSON()`.
// user_id lo pone la BD (default auth.uid()) y RLS lo comprueba.
export async function saveSubscription({ endpoint, keys }: PushSubscriptionJSON): Promise<void> {
  if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error('Suscripción push incompleta')
  // Sin policy update: un endpoint ya guardado se deja como está (on conflict do nothing).
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint', ignoreDuplicates: true })
  if (error) throw error
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) throw error
}
