import './index.css'
import { useDocumentState } from './hooks/useDocumentState'
import { AppHeader } from './components/AppHeader'
import { FormPanel } from './components/FormPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { ActionBar } from './components/ActionBar'

function App() {
  const { state, dispatch, totals, validate, derived } = useDocumentState()

  return (
    <div className="app-root">
      <AppHeader
        documentType={state.meta.type}
        documentTypeLabel={derived.documentTypeLabel}
        onChangeType={(type) => dispatch({ type: 'SET_TYPE', payload: type })}
      />

      <main className="app-main" aria-label="Veltro Invoice workspace">
        <FormPanel state={state} dispatch={dispatch} totals={totals} derived={derived} />
        <PreviewPanel state={state} totals={totals} derived={derived} />
      </main>

      <ActionBar
        state={state}
        validate={validate}
        dispatch={dispatch}
      />

      <footer
        style={{
          marginTop: 16,
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>A Veltro Product</span>
        <span>
          Built by Veltro ·{' '}
          <a
            href="https://veltrolabs.io"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            veltro.io
          </a>
        </span>
      </footer>
    </div>
  )
}

export default App
