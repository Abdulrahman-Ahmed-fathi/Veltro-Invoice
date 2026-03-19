import type { DocumentState } from '../hooks/useDocumentState'
import type { TotalsResult } from '../utils/calculations'
import { SectionCard, FieldWrapper, TextInput, TextArea, Select } from './ui/controls'

interface DerivedProps {
  documentTypeLabel: string
  statusOptions: string[]
}

interface FormPanelProps {
  state: DocumentState
  dispatch: React.Dispatch<any>
  totals: TotalsResult
  derived: DerivedProps
}

export const FormPanel: React.FC<FormPanelProps> = ({
  state,
  dispatch,
  totals,
  derived,
}) => {
  const { ui } = state

  const setYourField = (field: keyof DocumentState['your'], value: string) => {
    dispatch({ type: 'SET_YOUR_FIELD', field, value })
    if (field === 'name') dispatch({ type: 'CLEAR_FIELD_ERROR', field: 'yourName' })
    if (field === 'email') dispatch({ type: 'CLEAR_FIELD_ERROR', field: 'yourEmail' })
  }

  const setClientField = (field: keyof DocumentState['client'], value: string) => {
    dispatch({ type: 'SET_CLIENT_FIELD', field, value })
    if (field === 'name') dispatch({ type: 'CLEAR_FIELD_ERROR', field: 'clientName' })
  }

  const setMetaField = (field: keyof DocumentState['meta'], value: string) => {
    dispatch({ type: 'SET_META_FIELD', field, value })
    if (field === 'issueDate') dispatch({ type: 'CLEAR_FIELD_ERROR', field: 'issueDate' })
  }

  const currencyOptions: { code: string; label: string }[] = [
    { code: 'USD', label: '🇺🇸 USD ($)' },
    { code: 'EUR', label: '🇪🇺 EUR (€)' },
    { code: 'GBP', label: '🇬🇧 GBP (£)' },
    { code: 'EGP', label: '🇪🇬 EGP (£E)' },
    { code: 'SAR', label: '🇸🇦 SAR (﷼)' },
    { code: 'AED', label: '🇦🇪 AED (د.إ)' },
    { code: 'CAD', label: '🇨🇦 CAD ($)' },
    { code: 'AUD', label: '🇦🇺 AUD ($)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionCard title="Your Information">
        <div className="form-grid-two">
          <FieldWrapper
            label="Your Name / Company Name"
            required
            error={ui.errors.yourName}
          >
            <TextInput
              placeholder="e.g. John Doe or Acme Studio"
              value={state.your.name}
              onChange={(e) => setYourField('name', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Your Email"
            required
            hint="Used on the document header"
            error={ui.errors.yourEmail}
            warning={ui.warnings.yourEmail}
          >
            <TextInput
              type="email"
              placeholder="you@example.com"
              value={state.your.email}
              onChange={(e) => setYourField('email', e.target.value)}
            />
          </FieldWrapper>
        </div>
        <div className="form-grid-two">
          <FieldWrapper label="Your Phone">
            <TextInput
              placeholder="+1 555 000 0000"
              value={state.your.phone}
              onChange={(e) => setYourField('phone', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="Your Address">
            <TextArea
              rows={2}
              placeholder="Street, City, Country"
              value={state.your.address}
              onChange={(e) => setYourField('address', e.target.value)}
            />
          </FieldWrapper>
        </div>
      </SectionCard>

      <SectionCard title="Client Information">
        <div className="form-grid-two">
          <FieldWrapper
            label="Client Name / Company"
            required
            error={ui.errors.clientName}
          >
            <TextInput
              placeholder="Client or company name"
              value={state.client.name}
              onChange={(e) => setClientField('name', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Client Email"
            warning={ui.warnings.clientEmail}
          >
            <TextInput
              type="email"
              placeholder="client@example.com"
              value={state.client.email}
              onChange={(e) => setClientField('email', e.target.value)}
            />
          </FieldWrapper>
        </div>
        <div className="form-grid-two">
          <FieldWrapper label="Client Phone">
            <TextInput
              placeholder="+1 555 000 0000"
              value={state.client.phone}
              onChange={(e) => setClientField('phone', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="Client Address">
            <TextArea
              rows={2}
              placeholder="Street, City, Country"
              value={state.client.address}
              onChange={(e) => setClientField('address', e.target.value)}
            />
          </FieldWrapper>
        </div>
      </SectionCard>

      <SectionCard title="Document Details">
        <div className="form-grid-two">
          <FieldWrapper label="Document Type">
            <TextInput value={derived.documentTypeLabel} readOnly />
          </FieldWrapper>
          <FieldWrapper label="Document Number" required>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TextInput
                value={state.meta.number}
                onChange={(e) => setMetaField('number', e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ paddingInline: 10 }}
                onClick={() =>
                  dispatch({
                    type: 'SET_META_FIELD',
                    field: 'number',
                    value: '',
                  })
                }
              >
                Regenerate
              </button>
            </div>
          </FieldWrapper>
        </div>
        <div className="form-grid-two">
          <FieldWrapper
            label="Issue Date"
            required
            error={ui.errors.issueDate}
          >
            <TextInput
              type="date"
              value={state.meta.issueDate}
              onChange={(e) => setMetaField('issueDate', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper
            label={
              state.meta.type === 'invoice'
                ? 'Due Date'
                : 'Valid Until'
            }
          >
            <TextInput
              type="date"
              value={state.meta.dueDate}
              onChange={(e) => setMetaField('dueDate', e.target.value)}
            />
          </FieldWrapper>
        </div>
        <div className="form-grid-two">
          <FieldWrapper label="Currency">
            <Select
              value={state.meta.currency}
              onChange={(e) =>
                setMetaField('currency', e.target.value)
              }
            >
              {currencyOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Status">
            <Select
              value={state.meta.status}
              onChange={(e) =>
                setMetaField('status', e.target.value)
              }
            >
              {derived.statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>
      </SectionCard>

      <SectionCard title="Line Items">
        {/* Simplified line items table; preview handles formatted view */}
        {ui.errors.lineItems && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 12,
              color: 'var(--color-error)',
            }}
          >
            {ui.errors.lineItems}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {state.lineItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) 0.7fr 0.9fr 0.9fr auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                #{index + 1}
              </span>
              <TextInput
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_LINE_ITEM',
                    id: item.id,
                    field: 'description',
                    value: e.target.value,
                  })
                }
              />
              <TextInput
                type="number"
                min={1}
                placeholder="Qty"
                value={item.quantity.toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_LINE_ITEM',
                    id: item.id,
                    field: 'quantity',
                    value: e.target.value,
                  })
                }
              />
              <TextInput
                type="number"
                min={0}
                step="0.01"
                placeholder="Unit Price"
                value={item.unitPrice.toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_LINE_ITEM',
                    id: item.id,
                    field: 'unitPrice',
                    value: e.target.value,
                  })
                }
              />
              <button
                type="button"
                className="btn btn-ghost"
                aria-label="Remove line item"
                disabled={state.lineItems.length === 1}
                onClick={() =>
                  dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id })
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
        >
          + Add Line Item
        </button>

        <div
          style={{
            marginTop: 12,
            borderTop: '1px solid var(--color-border)',
            paddingTop: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <Row label="Subtotal">
            {totals.subtotal.toFixed(2)}
          </Row>
          <Row label="Discount">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TextInput
                type="number"
                min={0}
                step="0.01"
                value={state.discountValue.toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DISCOUNT_VALUE',
                    payload: Number(e.target.value) || 0,
                  })
                }
                style={{ width: 90 }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  dispatch({
                    type: 'SET_DISCOUNT_MODE',
                    payload:
                      ui.discountMode === 'percent'
                        ? 'fixed'
                        : 'percent',
                  })
                }
              >
                {ui.discountMode === 'percent' ? '%' : state.meta.currency}
              </button>
            </div>
          </Row>
          <Row label={state.extras.taxLabel || 'Tax'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TextInput
                type="number"
                min={0}
                step="0.01"
                value={state.taxValue.toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_TAX_VALUE',
                    payload: Number(e.target.value) || 0,
                  })
                }
                style={{ width: 90 }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  dispatch({
                    type: 'SET_TAX_MODE',
                    payload:
                      ui.taxMode === 'percent' ? 'fixed' : 'percent',
                  })
                }
              >
                {ui.taxMode === 'percent' ? '%' : state.meta.currency}
              </button>
            </div>
          </Row>
          <Row
            label="Grand Total"
            strong
            highlightKey={ui.totalsHighlightKey}
          >
            {totals.grandTotal.toFixed(2)}
          </Row>
        </div>
      </SectionCard>

      <SectionCard title="Additional Details">
        <FieldWrapper label="Notes">
          <TextArea
            placeholder="e.g. Thank you for your business!"
            value={state.extras.notes}
            onChange={(e) =>
              dispatch({
                type: 'SET_EXTRA_FIELD',
                field: 'notes',
                value: e.target.value,
              })
            }
          />
        </FieldWrapper>
        <FieldWrapper label="Terms & Conditions">
          <TextArea
            placeholder="e.g. Payment due within 30 days of invoice date."
            value={state.extras.terms}
            onChange={(e) =>
              dispatch({
                type: 'SET_EXTRA_FIELD',
                field: 'terms',
                value: e.target.value,
              })
            }
          />
        </FieldWrapper>
        <FieldWrapper label="Payment Methods">
          <TextArea
            placeholder="e.g. Bank transfer: IBAN XX00 0000 0000 0000"
            value={state.extras.paymentMethods}
            onChange={(e) =>
              dispatch({
                type: 'SET_EXTRA_FIELD',
                field: 'paymentMethods',
                value: e.target.value,
              })
            }
          />
        </FieldWrapper>
      </SectionCard>
    </div>
  )
}

const Row: React.FC<{
  label: string
  strong?: boolean
  highlightKey?: number
  children: React.ReactNode
}> = ({ label, strong, highlightKey, children }) => (
  <div
    className={highlightKey ? 'totals-highlight-enter' : undefined}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%',
    }}
  >
    <span
      style={{
        fontSize: 12,
        color: '#6b7280',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: strong ? 16 : 13,
        fontWeight: strong ? 600 : 500,
        color: strong ? 'var(--color-accent)' : 'var(--color-text)',
      }}
    >
      {children}
    </span>
  </div>
)

