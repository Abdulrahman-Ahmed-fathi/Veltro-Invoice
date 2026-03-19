import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { DocumentState } from '../hooks/useDocumentState'

interface ActionBarProps {
  state: DocumentState
  dispatch: React.Dispatch<any>
  validate: () => { errors: any; warnings: any }
}

export const ActionBar: React.FC<ActionBarProps> = ({
  state,
  dispatch,
  validate,
}) => {
  const handleResetClick = () => {
    dispatch({ type: 'SET_UI_FLAG', field: 'showResetConfirm', value: true })
  }

  const handleConfirmReset = () => {
    dispatch({ type: 'RESET' })
  }

  const performValidation = () => {
    const { errors } = validate()
    return Object.keys(errors).length === 0
  }

  const handlePrint = () => {
    if (!performValidation()) return
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!performValidation()) return

    dispatch({ type: 'SET_UI_FLAG', field: 'isGeneratingPdf', value: true })
    dispatch({ type: 'SET_UI_FLAG', field: 'pdfSuccess', value: false })

    try {
      const element = document.getElementById('preview-document')
      if (!element) throw new Error('Preview element not found')

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const marginTop = 6
      pdf.addImage(imgData, 'PNG', 0, marginTop, imgWidth, imgHeight)

      const prefix = state.meta.type === 'invoice' ? 'Veltro-Invoice-' : 'Veltro-Quotation-'
      const safeNumber = state.meta.number.replace(/[^\w-]/g, '')
      pdf.save(`${prefix}${safeNumber || 'Document'}.pdf`)

      dispatch({ type: 'SET_UI_FLAG', field: 'pdfSuccess', value: true })
      setTimeout(() => {
        dispatch({ type: 'SET_UI_FLAG', field: 'pdfSuccess', value: false })
      }, 1800)
    } catch (e) {
      console.error(e)
    } finally {
      dispatch({ type: 'SET_UI_FLAG', field: 'isGeneratingPdf', value: false })
    }
  }

  return (
    <div className="action-bar">
      <div className="action-bar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleResetClick}
          >
            Reset Form
          </button>
          {state.ui.showResetConfirm && (
            <div
              className="card"
              style={{
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
              }}
            >
              <span>
                Are you sure? This will clear all fields.
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmReset}
              >
                Yes, Reset
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  dispatch({
                    type: 'SET_UI_FLAG',
                    field: 'showResetConfirm',
                    value: false,
                  })
                }
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={state.ui.isGeneratingPdf}
          >
            {state.ui.isGeneratingPdf
              ? 'Generating...'
              : state.ui.pdfSuccess
              ? 'Downloaded'
              : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

