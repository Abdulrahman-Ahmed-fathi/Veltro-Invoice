import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { createClient, deleteClient, listClients, updateClient } from '../../services/clients'
import { listInvoices } from '../../services/invoices'
import type { Client } from '../../types/models'

const initialForm = { name: '', company: '', email: '', phone: '', address: '' }

export function ClientsPage() {
  const { session } = useAuth()
  const { t } = useLanguage()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(params.get('add') === '1')
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(initialForm)
  const [totals, setTotals] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    const rows = await listClients(search)
    setClients(rows)
    const invoices = await listInvoices({ page: 1, perPage: 300 })
    const nextTotals = invoices.rows.reduce<Record<string, number>>((acc, row) => {
      if (!row.client_id) return acc
      acc[row.client_id] = (acc[row.client_id] ?? 0) + Number(row.grand_total)
      return acc
    }, {})
    setTotals(nextTotals)
  }, [search])

  useEffect(() => {
    load().catch(() => pushToast(t.errorGeneric, 'error'))
  }, [load, pushToast, t.errorGeneric])

  const selectedClient = useMemo(() => clients.find((client) => client.id === editing?.id) ?? null, [clients, editing])

  return (
    <div className="page-grid">
      <div className="card panel">
        <div className="panel-head">
          <input className="text-input" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { setOpen(true); setEditing(null); setForm(initialForm) }}>
            <Plus size={14} /> {t.addClient}
          </button>
        </div>
        {clients.length === 0 ? <p>{t.noClients}</p> : (
          <div className="client-grid">
            {clients.map((client) => (
              <article className="card client-card" key={client.id}>
                <div className="avatar">{client.name.slice(0, 2).toUpperCase()}</div>
                <h3>{client.name}</h3>
                <p>{client.company}</p>
                <p>{client.email}</p>
                <p>{client.phone}</p>
                <strong>{t.totalInvoiced}: {totals[client.id] ?? 0}</strong>
                <div className="client-actions">
                  <button className="btn btn-outline" onClick={() => navigate(`/new?clientId=${client.id}&type=invoice`)}>{t.createNewInvoice}</button>
                  <button className="btn btn-ghost" onClick={() => { setOpen(true); setEditing(client); setForm({
                    name: client.name,
                    company: client.company ?? '',
                    email: client.email ?? '',
                    phone: client.phone ?? '',
                    address: client.address ?? '',
                  }) }}>{t.edit}</button>
                  <button className="btn btn-ghost" onClick={async () => {
                    await deleteClient(client.id)
                    pushToast(t.successDeleted, 'success')
                    load()
                  }}>{t.delete}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedClient ? (
        <div className="card panel">
          <h3>{selectedClient.name}</h3>
          <p>{selectedClient.address}</p>
        </div>
      ) : null}
      {open ? (
        <div className="modal-backdrop">
          <div className="card modal">
            <h3>{editing ? t.updateClient : t.addClient}</h3>
            <input className="text-input" placeholder={t.clientName} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="text-input" placeholder={t.company} value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
            <input className="text-input" placeholder={t.email} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            <input className="text-input" placeholder={t.phone} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            <textarea className="text-area" placeholder={t.address} value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            <div className="editor-actions">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  if (!session) return
                  if (editing) {
                    await updateClient(editing.id, { ...form })
                  } else {
                    await createClient({ user_id: session.user.id, ...form, total_invoiced: 0 } as never)
                  }
                  setOpen(false)
                  load()
                  pushToast(t.successSaved, 'success')
                } catch {
                  pushToast(t.errorGeneric, 'error')
                }
              }}>{t.save}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
