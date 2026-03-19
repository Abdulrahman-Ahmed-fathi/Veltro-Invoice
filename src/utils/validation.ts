import type { LineItem } from './calculations'

export interface FieldErrors {
  yourName?: string
  yourEmail?: string
  clientName?: string
  issueDate?: string
  lineItems?: string
}

export interface FieldWarnings {
  yourEmail?: string
  clientEmail?: string
}

export interface ValidationInput {
  yourName: string
  yourEmail: string
  clientName: string
  issueDate: string
  lineItems: LineItem[]
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateDocument = (input: ValidationInput) => {
  const errors: FieldErrors = {}
  const warnings: FieldWarnings = {}

  if (!input.yourName.trim()) {
    errors.yourName = 'Your name or company is required.'
  }

  if (!input.yourEmail.trim()) {
    errors.yourEmail = 'Your email is required.'
  } else if (!emailRegex.test(input.yourEmail.trim())) {
    warnings.yourEmail = 'This email looks unusual. Please double-check.'
  }

  if (!input.clientName.trim()) {
    errors.clientName = 'Client name or company is required.'
  }

  if (!input.issueDate) {
    errors.issueDate = 'Issue date is required.'
  }

  const hasValidLineItem = input.lineItems.some(
    (item) => item.description.trim() && item.unitPrice > 0,
  )

  if (!hasValidLineItem) {
    errors.lineItems =
      'Add at least one line item with a description and a unit price greater than 0.'
  }

  return { errors, warnings }
}

