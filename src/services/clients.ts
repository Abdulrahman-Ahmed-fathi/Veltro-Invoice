import { supabase } from '../lib/supabase'
import type { Client } from '../types/models'

export async function listClients(search = ''): Promise<Client[]> {
  let query = supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Client[]
}

export async function createClient(payload: Omit<Client, 'id' | 'created_at' | 'total_invoiced'>) {
  const { data, error } = await supabase.from('clients').insert(payload).select('*').single()
  if (error) throw error
  return data as Client
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data as Client
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}
