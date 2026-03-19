export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'EGP'
  | 'SAR'
  | 'AED'
  | 'CAD'
  | 'AUD'

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  EGP: '£E',
  SAR: '﷼',
  AED: 'د.إ',
  CAD: '$',
  AUD: '$',
}

export type DiscountMode = 'percent' | 'fixed'
export type TaxMode = 'percent' | 'fixed'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface TotalsInput {
  items: LineItem[]
  discountValue: number
  discountMode: DiscountMode
  taxValue: number
  taxMode: TaxMode
}

export interface TotalsResult {
  subtotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
}

export const calculateLineTotal = (item: LineItem): number => {
  const qty = Number.isFinite(item.quantity) ? item.quantity : 0
  const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0
  return qty * price
}

export const calculateTotals = (input: TotalsInput): TotalsResult => {
  const subtotal = input.items.reduce(
    (acc, item) => acc + calculateLineTotal(item),
    0,
  )

  let discountAmount = 0
  if (input.discountMode === 'percent') {
    const pct = Math.max(0, input.discountValue)
    discountAmount = (subtotal * pct) / 100
  } else {
    discountAmount = Math.max(0, input.discountValue)
  }

  const baseForTax = Math.max(0, subtotal - discountAmount)

  let taxAmount = 0
  if (input.taxMode === 'percent') {
    const pct = Math.max(0, input.taxValue)
    taxAmount = (baseForTax * pct) / 100
  } else {
    taxAmount = Math.max(0, input.taxValue)
  }

  const grandTotal = Math.max(0, baseForTax + taxAmount)

  return { subtotal, discountAmount, taxAmount, grandTotal }
}

export const formatCurrency = (amount: number, currency: CurrencyCode): string =>
  `${currencySymbols[currency]}${amount.toFixed(2)}`

