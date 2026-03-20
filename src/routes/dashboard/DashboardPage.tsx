import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getStatusLabel, statusColorMap } from '../../i18n/translations'
import { getRecentDocuments, listInvoices } from '../../services/invoices'
import type { InvoiceRecord } from '../../types/models'
import { currencySymbols } from '../../utils/document'

export function DashboardPage() {
  const { t, language } = useLanguage()
  const [rows, setRows] = useState<InvoiceRecord[]>([])
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0, currency: 'USD' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      const [recent, all] = await Promise.all([getRecentDocuments(5), listInvoices({ page: 1, perPage: 300 })])
      if (!mounted) return
      setRows(recent)
      const today = new Date().toISOString().slice(0, 10)
      const currencies = all.rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.currency] = (acc[row.currency] ?? 0) + 1
        return acc
      }, {})
      const currency = Object.entries(currencies).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'USD'
      setStats({
        total: all.rows.reduce((sum, row) => sum + Number(row.grand_total), 0),
        paid: all.rows.filter((row) => row.status === 'paid').reduce((sum, row) => sum + Number(row.grand_total), 0),
        pending: all.rows.filter((row) => row.status === 'sent').reduce((sum, row) => sum + Number(row.grand_total), 0),
        overdue: all.rows
          .filter((row) => row.status === 'sent' && row.due_date < today)
          .reduce((sum, row) => sum + Number(row.grand_total), 0),
        currency,
      })
      setLoading(false)
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const insight = useMemo(() => {
    const overdueCount = rows.filter((row) => row.status === 'sent' && row.due_date < new Date().toISOString().slice(0, 10)).length
    if (overdueCount > 0) return t.overdueCountInsight(overdueCount)
    return t.sentCountInsight(rows.filter((row) => row.status === 'sent').length)
  }, [rows, t])

  const symbol = currencySymbols[stats.currency as keyof typeof currencySymbols] ?? stats.currency

  return (
    <div className="page-grid">
      <section className="stats-grid">
        {[
          [t.totalInvoiced, stats.total, 'accent'],
          [t.totalPaid, stats.paid, 'success'],
          [t.pending, stats.pending, 'warning'],
          [t.overdue, stats.overdue, 'error'],
        ].map(([label, value, color]) => (
          <article className={`card stat-card ${color}`} key={label}>
            <span>{label}</span>
            <strong>{loading ? '...' : `${symbol} ${Number(value).toFixed(2)}`}</strong>
          </article>
        ))}
      </section>
      <section className="split-panels">
        <div className="card panel">
          <div className="panel-head">
            <h3>{t.recentDocuments}</h3>
            <Link to="/history">{t.viewAll}</Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>{t.clientName}</th><th>{t.issueDate}</th><th>{t.total}</th><th>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const overdue = row.status === 'sent' && row.due_date < new Date().toISOString().slice(0, 10)
                const status = overdue ? 'overdue' : row.status
                return (
                  <tr key={row.id} onClick={() => navigate(`/new?id=${row.id}`)}>
                    <td>{row.number}</td><td>{row.client_name}</td><td>{row.issue_date}</td><td>{symbol} {row.grand_total}</td>
                    <td><span className="badge" style={{ background: `${statusColorMap[status]}20`, color: statusColorMap[status] }}>{getStatusLabel(language, status)}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="card panel quick-actions">
          <h3>{t.newDocument}</h3>
          <button className="btn btn-primary" onClick={() => navigate('/new?type=invoice')}>{t.createNewInvoice}</button>
          <button className="btn btn-outline" onClick={() => navigate('/new?type=quotation')}>{t.createNewQuotation}</button>
          <button className="btn btn-ghost" onClick={() => navigate('/clients?add=1')}>{t.addNewClient}</button>
          <p>{insight}</p>
        </div>
      </section>
    </div>
  )
}
