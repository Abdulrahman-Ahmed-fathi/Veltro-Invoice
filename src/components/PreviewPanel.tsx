import type { DocumentState } from '../hooks/useDocumentState'
import type { TotalsResult } from '../utils/calculations'
import { currencySymbols } from '../utils/calculations'

interface DerivedProps {
  documentTypeLabel: string
  statusOptions: string[]
}

interface PreviewPanelProps {
  state: DocumentState
  totals: TotalsResult
  derived: DerivedProps
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  state,
  totals,
  derived,
}) => {
  const symbol = currencySymbols[state.meta.currency]

  const statusColor = (() => {
    switch (state.meta.status) {
      case 'Paid':
      case 'Accepted':
        return 'var(--color-success)'
      case 'Declined':
        return 'var(--color-error)'
      case 'Sent':
        return 'var(--color-accent)'
      default:
        return '#6b7280'
    }
  })()

  return (
    <aside className="preview-shell">
      <div className="preview-label">Live Preview</div>
      <div
        id="preview-document"
        className="preview-paper"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 32,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                marginBottom: 12,
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#9ca3af',
                  fontWeight: 500,
                }}
              >
                Your Logo
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#111827',
                  marginBottom: 4,
                }}
              >
                {state.your.name || 'Your Name / Company'}
              </div>
              {state.your.email && <div>{state.your.email}</div>}
              {state.your.phone && <div>{state.your.phone}</div>}
              {state.your.address && <div>{state.your.address}</div>}
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: 'var(--color-accent)',
                marginBottom: 4,
              }}
            >
              {derived.documentTypeLabel.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#6b7280',
                marginBottom: 4,
              }}
            >
              <div>#{state.meta.number}</div>
              <div>Issued: {state.meta.issueDate}</div>
              <div>
                {state.meta.type === 'invoice' ? 'Due: ' : 'Valid Until: '}
                {state.meta.dueDate}
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                padding: '2px 8px',
                borderRadius: 999,
                border: `1px solid ${statusColor}`,
                fontSize: 11,
                fontWeight: 500,
                color: statusColor,
                textTransform: 'uppercase',
              }}
            >
              {state.meta.status}
            </span>
          </div>
        </div>

        <section style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: '#9ca3af',
              marginBottom: 4,
            }}
          >
            Bill To
          </div>
          <div style={{ fontSize: 13 }}>
            <div
              style={{
                fontWeight: 600,
                color: '#111827',
                marginBottom: 2,
              }}
            >
              {state.client.name || 'Client Name / Company'}
            </div>
            <div style={{ color: '#6b7280' }}>
              {state.client.email && <div>{state.client.email}</div>}
              {state.client.phone && <div>{state.client.phone}</div>}
              {state.client.address && <div>{state.client.address}</div>}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f3f4f6',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: '#6b7280',
                }}
              >
                <th
                  style={{
                    padding: '8px 8px',
                    textAlign: 'left',
                    width: 32,
                  }}
                >
                  #
                </th>
                <th style={{ padding: '8px 8px', textAlign: 'left' }}>
                  Description
                </th>
                <th style={{ padding: '8px 8px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '8px 8px', textAlign: 'right' }}>
                  Unit Price
                </th>
                <th style={{ padding: '8px 8px', textAlign: 'right' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {state.lineItems.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}
                >
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'left',
                      color: '#6b7280',
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'left',
                    }}
                  >
                    {item.description || '—'}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'right',
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'right',
                    }}
                  >
                    {symbol}
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'right',
                    }}
                  >
                    {symbol}
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 32,
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, fontSize: 12, color: '#6b7280' }}>
            {state.extras.notes && (
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: 11,
                    color: '#9ca3af',
                    marginBottom: 2,
                  }}
                >
                  Notes
                </div>
                <div>{state.extras.notes}</div>
              </div>
            )}
            {state.extras.terms && (
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: 11,
                    color: '#9ca3af',
                    marginBottom: 2,
                  }}
                >
                  Terms &amp; Conditions
                </div>
                <div>{state.extras.terms}</div>
              </div>
            )}
            {state.extras.paymentMethods && (
              <div>
                <div
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: 11,
                    color: '#9ca3af',
                    marginBottom: 2,
                  }}
                >
                  Payment Methods
                </div>
                <div>{state.extras.paymentMethods}</div>
              </div>
            )}
          </div>

          <div
            style={{
              minWidth: 220,
              fontSize: 13,
            }}
          >
            <Row label="Subtotal">
              {symbol}
              {totals.subtotal.toFixed(2)}
            </Row>
            {totals.discountAmount > 0 && (
              <Row label="Discount">
                -{symbol}
                {totals.discountAmount.toFixed(2)}
              </Row>
            )}
            {totals.taxAmount > 0 && (
              <Row label={state.extras.taxLabel || 'Tax'}>
                {symbol}
                {totals.taxAmount.toFixed(2)}
              </Row>
            )}
            <div
              style={{
                borderTop: '1px solid #e5e7eb',
                marginTop: 8,
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                }}
              >
                Grand Total
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                }}
              >
                {symbol}
                {totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 11,
            color: '#9ca3af',
            fontStyle: 'italic',
          }}
        >
          Generated by Veltro Invoice · veltro.io
        </footer>
      </div>
    </aside>
  )
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4,
    }}
  >
    <span style={{ color: '#6b7280', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 500 }}>{children}</span>
  </div>
)

