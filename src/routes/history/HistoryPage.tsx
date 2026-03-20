import { useCallback, useEffect, useState } from 'react'
import { Copy, Download, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { getStatusLabel, getTypeLabel, statusColorMap } from '../../i18n/translations'
import { createInvoice, deleteInvoice, listInvoices, updateInvoice } from '../../services/invoices'
import type { InvoiceRecord } from '../../types/models'
import { currencySymbols, generateDocumentNumber } from '../../utils/document'

export function HistoryPage() {
  const { t, language } = useLanguage()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [rows, setRows] = useState<InvoiceRecord[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listInvoices({ page, perPage: 10, search, type, status, sort })
      setRows(result.rows)
      setCount(result.count)
    } catch {
      pushToast(t.errorGeneric, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, sort, status, t.errorGeneric, type, pushToast])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(count / 10))

  return (
    <div className="card panel">
      <div className="filters">
        <input className="text-input" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select-input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">{t.all}</option><option value="invoice">{t.invoice}</option><option value="quotation">{t.quotation}</option>
        </select>
        <select className="select-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t.all}</option><option value="draft">{getStatusLabel(language, 'draft')}</option><option value="sent">{getStatusLabel(language, 'sent')}</option><option value="paid">{getStatusLabel(language, 'paid')}</option><option value="accepted">{getStatusLabel(language, 'accepted')}</option><option value="declined">{getStatusLabel(language, 'declined')}</option>
        </select>
        <select className="select-input" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="newest">{t.newest}</option><option value="oldest">{t.oldest}</option><option value="amount_desc">{t.amountHighToLow}</option><option value="amount_asc">{t.amountLowToHigh}</option>
        </select>
      </div>
      {loading ? <div className="skeleton-list" /> : rows.length === 0 ? <p>{t.noDocuments}</p> : (
        <table className="table">
          <thead><tr><th>#</th><th>{t.invoice}/{t.quotation}</th><th>{t.clientName}</th><th>{t.issueDate}</th><th>{t.dueDate}</th><th>{t.total}</th><th>{t.status}</th><th>{t.actions}</th></tr></thead>
          <tbody>
            {rows.map((row) => {
              const overdue = row.status === 'sent' && row.due_date < new Date().toISOString().slice(0, 10)
              const statusValue = overdue ? 'overdue' : row.status
              return (
                <tr key={row.id} className={overdue ? 'overdue-row' : ''}>
                  <td onClick={() => navigate(`/new?id=${row.id}`)}>{row.number}</td>
                  <td>{getTypeLabel(language, row.type)}</td>
                  <td>{row.client_name}</td>
                  <td>{row.issue_date}</td>
                  <td>{row.due_date}</td>
                  <td>{currencySymbols[row.currency]} {row.grand_total}</td>
                  <td>
                    <select className="select-input" value={row.status} onChange={async (e) => {
                      await updateInvoice(row.id, { status: e.target.value as InvoiceRecord['status'] })
                      load()
                    }}>
                      {['draft', 'sent', 'paid', 'accepted', 'declined'].map((item) => <option key={item} value={item}>{getStatusLabel(language, item as never)}</option>)}
                    </select>
                    <span className="badge" style={{ background: `${statusColorMap[statusValue]}20`, color: statusColorMap[statusValue] }}>{getStatusLabel(language, statusValue)}</span>
                  </td>
                  <td className="action-icons">
                    <button className="icon-btn" onClick={() => navigate(`/new?id=${row.id}`)}><Pencil size={14} /></button>
                    <button className="icon-btn" onClick={async () => {
                      await createInvoice({
                        ...row,
                        user_id: row.user_id,
                        number: generateDocumentNumber(row.type),
                        status: 'draft',
                        issue_date: new Date().toISOString().slice(0, 10),
                        due_date: new Date().toISOString().slice(0, 10),
                      })
                      load()
                    }}><Copy size={14} /></button>
                    <button className="icon-btn"><Download size={14} /></button>
                    {confirmingId === row.id ? (
                      <>
                        <button className="btn btn-ghost" onClick={async () => {
                          await deleteInvoice(row.id)
                          setConfirmingId(null)
                          pushToast(t.successDeleted, 'success')
                          load()
                        }}>{t.yesDelete}</button>
                        <button className="btn btn-ghost" onClick={() => setConfirmingId(null)}>{t.cancel}</button>
                      </>
                    ) : (
                      <button className="icon-btn danger" onClick={() => setConfirmingId(row.id)}><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button className="btn btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))}>{'<'}</button>
        <span>{t.page} {page}/{totalPages}</span>
        <button className="btn btn-ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>{'>'}</button>
      </div>
    </div>
  )
}
