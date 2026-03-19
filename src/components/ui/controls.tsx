import React from 'react'

interface FieldWrapperProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  warning?: string
  children: React.ReactNode
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  required,
  hint,
  error,
  warning,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--color-error)', fontSize: 11 }}>*</span>
        )}
        {hint && (
          <span
            style={{
              marginLeft: 4,
              fontSize: 11,
              color: '#9ca3af',
              fontWeight: 400,
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-error)',
          }}
        >
          {error}
        </span>
      )}
      {!error && warning && (
        <span
          style={{
            fontSize: 11,
            color: '#f59e0b',
          }}
        >
          {warning}
        </span>
      )}
    </div>
  )
}

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const TextInput: React.FC<TextInputProps> = ({
  hasError,
  style,
  ...rest
}) => (
  <input
    {...rest}
    className="text-input"
    style={{
      borderColor: hasError ? 'var(--color-error)' : undefined,
      ...style,
    }}
  />
)

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const TextArea: React.FC<TextAreaProps> = ({
  hasError,
  style,
  ...rest
}) => (
  <textarea
    {...rest}
    className="text-area"
    style={{
      borderColor: hasError ? 'var(--color-error)' : undefined,
      ...style,
    }}
  />
)

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select: React.FC<SelectProps> = ({
  hasError,
  style,
  children,
  ...rest
}) => (
  <div className="select-wrapper" style={style}>
    <select
      {...rest}
      className="select-input"
      style={{
        borderColor: hasError ? 'var(--color-error)' : undefined,
      }}
    >
      {children}
    </select>
    <span className="select-chevron" aria-hidden="true">
      ▾
    </span>
  </div>
)

interface SectionCardProps {
  title: string
  children: React.ReactNode
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
}) => {
  return (
    <section
      className="card"
      style={{
        padding: 16,
        borderLeft: '3px solid var(--color-accent)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.2,
            textTransform: 'uppercase',
            color: 'var(--color-text-secondary)',
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'danger'
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  style,
  children,
  ...rest
}) => (
  <button
    type="button"
    {...rest}
    style={{
      borderRadius: 999,
      padding: 4,
      border: '1px solid transparent',
      backgroundColor:
        variant === 'danger'
          ? 'rgba(239, 68, 68, 0.06)'
          : 'transparent',
      color: variant === 'danger' ? '#b91c1c' : '#6b7280',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color var(--transition-fast), transform 80ms ease',
      ...style,
    }}
  >
    {children}
  </button>
)

