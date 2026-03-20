import type { CurrencyCode, DocumentStatus, DocumentType, InvoiceRecord, LineItem } from '../types/models'

export const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'CAD', 'AUD']
export const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: 'EUR',
  GBP: 'GBP',
  EGP: 'EGP',
  SAR: 'SAR',
  AED: 'AED',
  CAD: 'CAD',
  AUD: 'AUD',
}

export const emptyLineItem = (): LineItem => ({
  description: '',
  qty: 1,
  unit_price: 0,
  total: 0,
})

export function recalculateLineItems(items: LineItem[]) {
  return items.map((item) => ({
    ...item,
    total: Number((item.qty * item.unit_price).toFixed(2)),
  }))
}

export function computeTotals(params: {
  lineItems: LineItem[]
  discountType: 'percent' | 'fixed'
  discountValue: number
  taxType: 'percent' | 'fixed'
  taxValue: number
}) {
  const subtotal = params.lineItems.reduce((sum, item) => sum + item.total, 0)
  const discount =
    params.discountType === 'percent' ? (subtotal * params.discountValue) / 100 : params.discountValue
  const afterDiscount = Math.max(0, subtotal - discount)
  const tax = params.taxType === 'percent' ? (afterDiscount * params.taxValue) / 100 : params.taxValue
  const grandTotal = afterDiscount + tax
  return {
    subtotal: Number(subtotal.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  }
}

export function generateDocumentNumber(type: DocumentType) {
  const prefix = type === 'invoice' ? 'INV' : 'QTN'
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

export function getAllowedStatuses(type: DocumentType): DocumentStatus[] {
  return type === 'invoice' ? ['draft', 'sent', 'paid'] : ['draft', 'sent', 'accepted', 'declined']
}

export function getDefaultDocument(userId: string): Omit<InvoiceRecord, 'id' | 'created_at' | 'updated_at'> {
  const today = new Date()
  const due = new Date()
  due.setDate(today.getDate() + 30)
  return {
    user_id: userId,
    type: 'invoice',
    number: generateDocumentNumber('invoice'),
    status: 'draft',
    issue_date: today.toISOString().slice(0, 10),
    due_date: due.toISOString().slice(0, 10),
    currency: 'USD',
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    sender_logo_url: '',
    client_id: null,
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    line_items: [emptyLineItem()],
    subtotal: 0,
    discount_type: 'percent',
    discount_value: 0,
    tax_label: 'Tax',
    tax_type: 'percent',
    tax_value: 0,
    grand_total: 0,
    notes: '',
    terms: '',
    payment_info: '',
  }
}
