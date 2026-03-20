export type Language = 'en' | 'ar'

export type DocumentType = 'invoice' | 'quotation'

export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'accepted' | 'declined'

export type DiscountTaxType = 'percent' | 'fixed'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'SAR' | 'AED' | 'CAD' | 'AUD'

export interface LineItem {
  description: string
  qty: number
  unit_price: number
  total: number
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  total_invoiced: number
  created_at: string
}

export interface InvoiceRecord {
  id: string
  user_id: string
  type: DocumentType
  number: string
  status: DocumentStatus
  issue_date: string
  due_date: string
  currency: CurrencyCode
  sender_name: string
  sender_email: string
  sender_phone: string | null
  sender_address: string | null
  sender_logo_url: string | null
  client_id: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  line_items: LineItem[]
  subtotal: number
  discount_type: DiscountTaxType
  discount_value: number
  tax_label: string
  tax_type: DiscountTaxType
  tax_value: number
  grand_total: number
  notes: string | null
  terms: string | null
  payment_info: string | null
  created_at: string
  updated_at: string
}
