import { useEffect, useMemo, useRef, useState } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { getStatusLabel, getTypeLabel, statusColorMap } from '../../i18n/translations'
import { createClient, listClients } from '../../services/clients'
import { createInvoice, getInvoice, updateInvoice } from '../../services/invoices'
import type { Client, InvoiceRecord } from '../../types/models'
import { computeTotals, currencies, currencySymbols, emptyLineItem, generateDocumentNumber, getAllowedStatuses, getDefaultDocument, recalculateLineItems } from '../../utils/document'

export function DocumentEditorPage() {
  const { session } = useAuth()
  const { t, language } = useLanguage()
  const { pushToast } = useToast()
  const [params] = useSearchParams()
  const [data, setData] = useState<Omit<InvoiceRecord, 'id' | 'created_at' | 'updated_at'> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session) return
    const defaultDocument = getDefaultDocument(session.user.id)
    const type = params.get('type')
    if (type === 'quotation') {
      defaultDocument.type = 'quotation'
      defaultDocument.number = generateDocumentNumber('quotation')
    }
    setData(defaultDocument)
    listClients().then(setClients).catch(() => undefined)
    const editId = params.get('id')
    if (editId) {
      getInvoice(editId)
        .then((invoice) => {
          setEditingId(invoice.id)
          setData({
            ...invoice,
            user_id: invoice.user_id,
          })
        })
        .catch(() => pushToast(t.errorGeneric, 'error'))
    }
  }, [session, params, t, pushToast])

  const totals = useMemo(() => {
    if (!data) return { subtotal: 0, grandTotal: 0 }
    return computeTotals({
      lineItems: data.line_items,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      taxType: data.tax_type,
      taxValue: data.tax_value,
    })
  }, [data])

  if (!data || !session) return <div className="card panel">{t.loading}</div>

  const update = (patch: Partial<typeof data>) => setData((prev) => (prev ? { ...prev, ...patch } : prev))

  const saveDoc = async () => {
    setSaving(true)
    try {
      let clientId = data.client_id
      const shouldSaveClient = (document.getElementById('save-client') as HTMLInputElement | null)?.checked
      if (shouldSaveClient && data.client_name.trim()) {
        const created = await createClient({
          user_id: session.user.id,
          name: data.client_name,
          email: data.client_email,
          phone: data.client_phone,
          company: null,
          address: data.client_address,
        })
        clientId = created.id
      }
      const payload = {
        ...data,
        client_id: clientId,
        line_items: recalculateLineItems(data.line_items),
        subtotal: totals.subtotal,
        grand_total: totals.grandTotal,
      }
      if (editingId) {
        await updateInvoice(editingId, payload)
      } else {
        const created = await createInvoice(payload)
        setEditingId(created.id)
      }
      if ((document.getElementById('save-default') as HTMLInputElement | null)?.checked) {
        localStorage.setItem('veltro-default-sender', JSON.stringify({
          sender_name: data.sender_name,
          sender_email: data.sender_email,
          sender_phone: data.sender_phone,
          sender_address: data.sender_address,
        }))
      }
      pushToast(t.successSaved, 'success')
    } catch {
      pushToast(t.errorGeneric, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="editor-grid">
      <section className="card panel">
        <div className="type-toggle">
          {(['invoice', 'quotation'] as const).map((type) => (
            <button
              key={type}
              className={`pill-tab ${data.type === type ? 'selected' : ''}`}
              onClick={() => update({ type, number: generateDocumentNumber(type), status: 'draft' })}
            >
              {getTypeLabel(language, type)}
            </button>
          ))}
        </div>
        <h3>{t.yourInformation}</h3>
        <div className="form-grid-two">
          <input className="text-input" placeholder={t.yourName} value={data.sender_name} onChange={(e) => update({ sender_name: e.target.value })} />
          <input className="text-input" placeholder={t.email} value={data.sender_email} onChange={(e) => update({ sender_email: e.target.value })} />
          <input className="text-input" placeholder={t.phone} value={data.sender_phone ?? ''} onChange={(e) => update({ sender_phone: e.target.value })} />
          <textarea className="text-area" placeholder={t.address} value={data.sender_address ?? ''} onChange={(e) => update({ sender_address: e.target.value })} />
        </div>
        <label><input id="save-default" type="checkbox" /> {t.saveAsDefault}</label>

        <h3>{t.clientInformation}</h3>
        <input className="text-input" placeholder={t.search} onChange={async (e) => setClients(await listClients(e.target.value))} />
        <select className="select-input" value={data.client_id ?? ''} onChange={(e) => {
          const selected = clients.find((client) => client.id === e.target.value)
          if (!selected) return
          update({
            client_id: selected.id,
            client_name: selected.name,
            client_email: selected.email,
            client_phone: selected.phone,
            client_address: selected.address,
          })
        }}>
          <option value="">{t.clientName}</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <div className="form-grid-two">
          <input className="text-input" placeholder={t.clientName} value={data.client_name} onChange={(e) => update({ client_name: e.target.value })} />
          <input className="text-input" placeholder={t.email} value={data.client_email ?? ''} onChange={(e) => update({ client_email: e.target.value })} />
          <input className="text-input" placeholder={t.phone} value={data.client_phone ?? ''} onChange={(e) => update({ client_phone: e.target.value })} />
          <textarea className="text-area" placeholder={t.address} value={data.client_address ?? ''} onChange={(e) => update({ client_address: e.target.value })} />
        </div>
        <label><input id="save-client" type="checkbox" /> {t.saveThisClient}</label>

        <h3>{t.documentDetails}</h3>
        <div className="form-grid-two">
          <input className="text-input" value={data.number} onChange={(e) => update({ number: e.target.value })} />
          <input className="text-input" type="date" value={data.issue_date} onChange={(e) => update({ issue_date: e.target.value })} />
          <input className="text-input" type="date" value={data.due_date} onChange={(e) => update({ due_date: e.target.value })} />
          <select className="select-input" value={data.currency} onChange={(e) => update({ currency: e.target.value as InvoiceRecord['currency'] })}>
            {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
          <select className="select-input" value={data.status} onChange={(e) => update({ status: e.target.value as InvoiceRecord['status'] })}>
            {getAllowedStatuses(data.type).map((status) => <option key={status} value={status}>{getStatusLabel(language, status)}</option>)}
          </select>
        </div>

        <h3>{t.lineItems}</h3>
        {data.line_items.map((item, idx) => (
          <div className="line-item-row" key={idx}>
            <GripVertical size={14} />
            <input className="text-input" placeholder={t.description} value={item.description} onChange={(e) => {
              const next = [...data.line_items]
              next[idx] = { ...next[idx], description: e.target.value }
              update({ line_items: recalculateLineItems(next) })
            }} />
            <input className="text-input" type="number" value={item.qty} onChange={(e) => {
              const next = [...data.line_items]
              next[idx] = { ...next[idx], qty: Number(e.target.value) }
              update({ line_items: recalculateLineItems(next) })
            }} />
            <input className="text-input" type="number" value={item.unit_price} onChange={(e) => {
              const next = [...data.line_items]
              next[idx] = { ...next[idx], unit_price: Number(e.target.value) }
              update({ line_items: recalculateLineItems(next) })
            }} />
            <strong>{item.total.toFixed(2)}</strong>
            <button className="btn btn-ghost" onClick={() => update({ line_items: data.line_items.filter((_, lineIndex) => lineIndex !== idx) })}><Trash2 size={14} /></button>
          </div>
        ))}
        <button className="btn btn-outline" onClick={() => update({ line_items: [...data.line_items, emptyLineItem()] })}><Plus size={14} /> {t.lineItems}</button>
        <div className="totals-box">
          <div><span>{t.subtotal}</span><strong>{currencySymbols[data.currency]} {totals.subtotal.toFixed(2)}</strong></div>
          <div><span>{t.discount}</span><input className="text-input" type="number" value={data.discount_value} onChange={(e) => update({ discount_value: Number(e.target.value) })} /></div>
          <div><span>{t.taxVat}</span><input className="text-input" type="number" value={data.tax_value} onChange={(e) => update({ tax_value: Number(e.target.value) })} /></div>
          <div className="grand-total"><span>{t.grandTotal}</span><strong>{currencySymbols[data.currency]} {totals.grandTotal.toFixed(2)}</strong></div>
        </div>

        <h3>{t.additionalDetails}</h3>
        <textarea className="text-area" placeholder={t.notes} value={data.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} />
        <textarea className="text-area" placeholder={t.terms} value={data.terms ?? ''} onChange={(e) => update({ terms: e.target.value })} />
        <textarea className="text-area" placeholder={t.paymentInfo} value={data.payment_info ?? ''} onChange={(e) => update({ payment_info: e.target.value })} />

        <div className="editor-actions">
          <button className="btn btn-ghost" onClick={() => setData(getDefaultDocument(session.user.id))}>{t.resetForm}</button>
          <button className="btn btn-outline" onClick={saveDoc} disabled={saving}>{saving ? t.loading : t.save}</button>
          <button className="btn btn-primary" disabled={pdfLoading} onClick={async () => {
            setPdfLoading(true)
            try {
              await saveDoc()
              if (!previewRef.current) return
              const canvas = await html2canvas(previewRef.current, { scale: 2 })
              const img = canvas.toDataURL('image/png')
              const pdf = new jsPDF('p', 'mm', 'a4')
              const width = 210
              const height = (canvas.height * width) / canvas.width
              pdf.addImage(img, 'PNG', 0, 0, width, height)
              pdf.save(`Veltro-${getTypeLabel(language, data.type)}-${data.number}.pdf`)
            } finally {
              setPdfLoading(false)
            }
          }}>{pdfLoading ? t.generating : t.saveAndDownloadPdf}</button>
          <button className="btn btn-outline" onClick={() => window.print()}>{t.print}</button>
        </div>
      </section>
      <section className="preview-shell">
        <div id="preview-document" ref={previewRef} className="preview-paper">
          <header className="preview-header">
            <div>
              <h2>{getTypeLabel(language, data.type)}</h2>
              <p>{data.number}</p>
              <p>{t.issueDate}: {data.issue_date}</p>
              <p>{data.type === 'invoice' ? t.dueDate : t.validUntil}: {data.due_date}</p>
            </div>
            <span className="badge" style={{ background: `${statusColorMap[data.status]}20`, color: statusColorMap[data.status] }}>{getStatusLabel(language, data.status)}</span>
          </header>
          <section>
            <h4>{t.billTo}</h4>
            <p>{data.client_name}</p>
            <p>{data.client_email}</p>
            <p>{data.client_phone}</p>
            <p>{data.client_address}</p>
          </section>
          <table className="table">
            <thead><tr><th>#</th><th>{t.description}</th><th>{t.qty}</th><th>{t.unitPrice}</th><th>{t.total}</th></tr></thead>
            <tbody>
              {data.line_items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td><td>{item.description}</td><td>{item.qty}</td><td>{item.unit_price}</td><td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="totals-box">
            <div><span>{t.subtotal}</span><strong>{currencySymbols[data.currency]} {totals.subtotal.toFixed(2)}</strong></div>
            <div className="grand-total"><span>{t.grandTotal}</span><strong>{currencySymbols[data.currency]} {totals.grandTotal.toFixed(2)}</strong></div>
          </div>
          <p><strong>{t.notes}:</strong> {data.notes}</p>
          <p><strong>{t.terms}:</strong> {data.terms}</p>
          <p><strong>{t.paymentInfo}:</strong> {data.payment_info}</p>
        </div>
      </section>
    </div>
  )
}
