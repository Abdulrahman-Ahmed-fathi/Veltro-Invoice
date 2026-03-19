import { useMemo, useReducer } from 'react'
import {
  calculateTotals,
  type CurrencyCode,
  type DiscountMode,
  type LineItem,
  type TaxMode,
} from '../utils/calculations'
import {
  documentTypeLabel,
  generateDocumentNumber,
  getStatusOptions,
  plusDaysISO,
  todayISO,
  type DocumentStatus,
  type DocumentType,
} from '../utils/documentHelpers'
import { validateDocument, type FieldErrors, type FieldWarnings } from '../utils/validation'

export interface YourInfo {
  name: string
  email: string
  phone: string
  address: string
  logoDataUrl?: string
}

export interface ClientInfo {
  name: string
  email: string
  phone: string
  address: string
}

export interface DocumentMeta {
  type: DocumentType
  number: string
  issueDate: string
  dueDate: string
  currency: CurrencyCode
  status: DocumentStatus
}

export interface Extras {
  notes: string
  terms: string
  paymentMethods: string
  taxLabel: string
}

export interface UiState {
  discountMode: DiscountMode
  taxMode: TaxMode
  isGeneratingPdf: boolean
  pdfSuccess: boolean
  showResetConfirm: boolean
  showMobilePreview: boolean
  totalsHighlightKey: number
  errors: FieldErrors
  warnings: FieldWarnings
}

export interface DocumentState {
  your: YourInfo
  client: ClientInfo
  meta: DocumentMeta
  lineItems: LineItem[]
  discountValue: number
  taxValue: number
  extras: Extras
  ui: UiState
}

type Action =
  | { type: 'SET_TYPE'; payload: DocumentType }
  | { type: 'SET_YOUR_FIELD'; field: keyof YourInfo; value: string | undefined }
  | { type: 'SET_CLIENT_FIELD'; field: keyof ClientInfo; value: string }
  | { type: 'SET_META_FIELD'; field: keyof DocumentMeta; value: string | DocumentStatus | CurrencyCode }
  | { type: 'SET_DISCOUNT_MODE'; payload: DiscountMode }
  | { type: 'SET_TAX_MODE'; payload: TaxMode }
  | { type: 'SET_DISCOUNT_VALUE'; payload: number }
  | { type: 'SET_TAX_VALUE'; payload: number }
  | { type: 'SET_EXTRA_FIELD'; field: keyof Extras; value: string }
  | { type: 'SET_TAX_LABEL'; payload: string }
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: 'description' | 'quantity' | 'unitPrice'; value: string }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'REORDER_LINE_ITEMS'; fromIndex: number; toIndex: number }
  | { type: 'SET_ERRORS'; payload: FieldErrors }
  | { type: 'SET_WARNINGS'; payload: FieldWarnings }
  | { type: 'CLEAR_FIELD_ERROR'; field: keyof FieldErrors }
  | { type: 'SET_UI_FLAG'; field: keyof UiState; value: boolean }
  | { type: 'BUMP_TOTALS_HIGHLIGHT' }
  | { type: 'RESET' }

const createEmptyLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
})

const createInitialState = (type: DocumentType = 'invoice'): DocumentState => ({
  your: {
    name: '',
    email: '',
    phone: '',
    address: '',
  },
  client: {
    name: '',
    email: '',
    phone: '',
    address: '',
  },
  meta: {
    type,
    number: generateDocumentNumber(type),
    issueDate: todayISO(),
    dueDate: plusDaysISO(30),
    currency: 'USD',
    status: 'Draft',
  },
  lineItems: [createEmptyLineItem()],
  discountValue: 0,
  taxValue: 0,
  extras: {
    notes: '',
    terms: '',
    paymentMethods: '',
    taxLabel: 'Tax',
  },
  ui: {
    discountMode: 'percent',
    taxMode: 'percent',
    isGeneratingPdf: false,
    pdfSuccess: false,
    showResetConfirm: false,
    showMobilePreview: false,
    totalsHighlightKey: 0,
    errors: {},
    warnings: {},
  },
})

const reducer = (state: DocumentState, action: Action): DocumentState => {
  switch (action.type) {
    case 'SET_TYPE': {
      const metaType: DocumentType = action.payload
      return {
        ...state,
        meta: {
          ...state.meta,
          type: metaType,
          number: generateDocumentNumber(metaType),
          status: 'Draft',
        },
        ui: {
          ...state.ui,
          errors: { ...state.ui.errors, lineItems: undefined },
        },
      }
    }
    case 'SET_YOUR_FIELD':
      return {
        ...state,
        your: {
          ...state.your,
          [action.field]: action.value ?? '',
        },
      }
    case 'SET_CLIENT_FIELD':
      return {
        ...state,
        client: {
          ...state.client,
          [action.field]: action.value,
        },
      }
    case 'SET_META_FIELD':
      return {
        ...state,
        meta: {
          ...state.meta,
          [action.field]: action.value as any,
        },
      }
    case 'SET_DISCOUNT_MODE':
      return {
        ...state,
        ui: { ...state.ui, discountMode: action.payload },
      }
    case 'SET_TAX_MODE':
      return {
        ...state,
        ui: { ...state.ui, taxMode: action.payload },
      }
    case 'SET_DISCOUNT_VALUE':
      return { ...state, discountValue: Math.max(0, action.payload) }
    case 'SET_TAX_VALUE':
      return { ...state, taxValue: Math.max(0, action.payload) }
    case 'SET_EXTRA_FIELD':
      return {
        ...state,
        extras: {
          ...state.extras,
          [action.field]: action.value,
        },
      }
    case 'SET_TAX_LABEL':
      return {
        ...state,
        extras: { ...state.extras, taxLabel: action.payload || 'Tax' },
      }
    case 'ADD_LINE_ITEM':
      return {
        ...state,
        lineItems: [...state.lineItems, createEmptyLineItem()],
      }
    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id
            ? {
                ...item,
                [action.field]:
                  action.field === 'description'
                    ? action.value
                    : Number(action.value) || 0,
              }
            : item,
        ),
      }
    case 'REMOVE_LINE_ITEM': {
      if (state.lineItems.length === 1) {
        return state
      }
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      }
    }
    case 'REORDER_LINE_ITEMS': {
      const next = [...state.lineItems]
      const [moved] = next.splice(action.fromIndex, 1)
      next.splice(action.toIndex, 0, moved)
      return { ...state, lineItems: next }
    }
    case 'SET_ERRORS':
      return {
        ...state,
        ui: { ...state.ui, errors: action.payload },
      }
    case 'SET_WARNINGS':
      return {
        ...state,
        ui: { ...state.ui, warnings: action.payload },
      }
    case 'CLEAR_FIELD_ERROR': {
      const { [action.field]: _removed, ...rest } = state.ui.errors
      return {
        ...state,
        ui: { ...state.ui, errors: rest },
      }
    }
    case 'SET_UI_FLAG':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.field]: action.value,
        },
      }
    case 'BUMP_TOTALS_HIGHLIGHT':
      return {
        ...state,
        ui: {
          ...state.ui,
          totalsHighlightKey: state.ui.totalsHighlightKey + 1,
        },
      }
    case 'RESET':
      return createInitialState(state.meta.type)
    default:
      return state
  }
}

export const useDocumentState = () => {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState('invoice'),
  )

  const totals = useMemo(
    () =>
      calculateTotals({
        items: state.lineItems,
        discountValue: state.discountValue,
        discountMode: state.ui.discountMode,
        taxValue: state.taxValue,
        taxMode: state.ui.taxMode,
      }),
    [
      state.lineItems,
      state.discountValue,
      state.taxValue,
      state.ui.discountMode,
      state.ui.taxMode,
    ],
  )

  const validate = () => {
    const { errors, warnings } = validateDocument({
      yourName: state.your.name,
      yourEmail: state.your.email,
      clientName: state.client.name,
      issueDate: state.meta.issueDate,
      lineItems: state.lineItems,
    })
    dispatch({ type: 'SET_ERRORS', payload: errors })
    dispatch({ type: 'SET_WARNINGS', payload: warnings })
    return { errors, warnings }
  }

  const derived = {
    documentTypeLabel: documentTypeLabel(state.meta.type),
    statusOptions: getStatusOptions(state.meta.type),
  }

  return {
    state,
    dispatch,
    totals,
    validate,
    derived,
  }
}

