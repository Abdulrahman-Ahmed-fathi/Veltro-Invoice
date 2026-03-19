import type { DocumentType } from '../utils/documentHelpers'

interface AppHeaderProps {
  documentType: DocumentType
  documentTypeLabel: string
  onChangeType: (type: DocumentType) => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  documentType,
  onChangeType,
}) => {
  const isInvoice = documentType === 'invoice'

  return (
    <header
      className="card"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(59, 111, 232, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 2,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: -0.2,
                color: 'var(--color-text)',
              }}
            >
              Veltro Invoice
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--color-text-secondary)',
            }}
          >
            Generate professional invoices and quotations in seconds.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Document type"
        style={{
          display: 'inline-flex',
          padding: 4,
          borderRadius: 999,
          backgroundColor: '#f3f4f6',
          border: '1px solid var(--color-border)',
          gap: 4,
        }}
      >
        <button
          role="tab"
          aria-selected={isInvoice}
          onClick={() => onChangeType('invoice')}
          className="pill-tab"
        >
          Invoice
        </button>
        <button
          role="tab"
          aria-selected={!isInvoice}
          onClick={() => onChangeType('quotation')}
          className="pill-tab"
        >
          Quotation
        </button>
      </div>
    </header>
  )
}

