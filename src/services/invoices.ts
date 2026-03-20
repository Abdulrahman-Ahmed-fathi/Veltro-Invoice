import { supabase } from '../lib/supabase'
import type { InvoiceRecord } from '../types/models'

export interface InvoiceListParams {
  page?: number
  perPage?: number
  search?: string
  type?: string
  status?: string
  sort?: 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'
}

export async function listInvoices(params: InvoiceListParams = {}) {
  const page = params.page ?? 1
  const perPage = params.perPage ?? 10
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase.from('invoices').select('*', { count: 'exact' }).range(from, to)
  const sortMode = params.sort ?? 'newest'
  if (sortMode === 'oldest') query = query.order('created_at', { ascending: true })
  if (sortMode === 'newest') query = query.order('created_at', { ascending: false })
  if (sortMode === 'amount_desc') query = query.order('grand_total', { ascending: false })
  if (sortMode === 'amount_asc') query = query.order('grand_total', { ascending: true })
  if (params.type && params.type !== 'all') query = query.eq('type', params.type)
  if (params.status && params.status !== 'all') query = query.eq('status', params.status)
  if (params.search?.trim()) {
    query = query.or(
      `number.ilike.%${params.search}%,client_name.ilike.%${params.search}%,grand_total::text.ilike.%${params.search}%`,
    )
  }
  const { data, error, count } = await query
  if (error) throw error
  return { rows: (data ?? []) as InvoiceRecord[], count: count ?? 0 }
}

export async function getRecentDocuments(limit = 5) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as InvoiceRecord[]
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single()
  if (error) throw error
  return data as InvoiceRecord
}

export async function createInvoice(payload: Omit<InvoiceRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('invoices').insert(payload).select('*').single()
  if (error) throw error
  return data as InvoiceRecord
}

export async function updateInvoice(id: string, payload: Partial<InvoiceRecord>) {
  const { data, error } = await supabase.from('invoices').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data as InvoiceRecord
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
}
