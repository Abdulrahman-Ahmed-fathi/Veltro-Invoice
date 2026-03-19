export type DocumentType = 'invoice' | 'quotation'

const invoiceCounter = { current: 1 }
const quotationCounter = { current: 1 }

export const generateDocumentNumber = (type: DocumentType): string => {
  if (type === 'invoice') {
    const value = invoiceCounter.current++
    return `INV-${value.toString().padStart(3, '0')}`
  }
  const value = quotationCounter.current++
  return `QUO-${value.toString().padStart(3, '0')}`
}

export const todayISO = (): string => {
  return new Date().toISOString().slice(0, 10)
}

export const plusDaysISO = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const documentTypeLabel = (type: DocumentType): string =>
  type === 'invoice' ? 'Invoice' : 'Quotation'

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid'
export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined'
export type DocumentStatus = InvoiceStatus | QuotationStatus

export const getStatusOptions = (type: DocumentType): DocumentStatus[] =>
  type === 'invoice'
    ? ['Draft', 'Sent', 'Paid']
    : ['Draft', 'Sent', 'Accepted', 'Declined']

