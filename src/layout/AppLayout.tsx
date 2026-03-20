import { BarChart3, FilePlus2, Files, Languages, LogOut, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { signOut } from '../services/auth'
import { useToast } from '../context/ToastContext'
import type { ReactNode } from 'react'

export function AppLayout() {
  const { t, language, toggleLanguage } = useLanguage()
  const { pushToast } = useToast()
  const location = useLocation()

  const pageTitle = (() => {
    if (location.pathname.startsWith('/history')) return t.history
    if (location.pathname.startsWith('/clients')) return t.clients
    if (location.pathname.startsWith('/new')) return t.newDocument
    return t.dashboard
  })()

  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <div>
          <h1 className="brand-title">{t.appTitle}</h1>
          <nav className="sidebar-nav">
            <NavItem to="/" label={t.dashboard} icon={<BarChart3 size={16} />} />
            <NavItem to="/new" label={t.newDocument} icon={<FilePlus2 size={16} />} />
            <NavItem to="/history" label={t.history} icon={<Files size={16} />} />
            <NavItem to="/clients" label={t.clients} icon={<Users size={16} />} />
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="btn btn-outline" onClick={toggleLanguage}>
            <Languages size={14} /> {language === 'en' ? 'EN | AR' : 'AR | EN'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              try {
                await signOut()
              } catch {
                pushToast(t.errorGeneric, 'error')
              }
            }}
          >
            <LogOut size={14} /> {t.logout}
          </button>
          <small>{t.footerCredit}</small>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar card">
          <h2>{pageTitle}</h2>
          <button className="btn btn-outline" onClick={toggleLanguage}>
            {language === 'en' ? 'EN | AR' : 'AR | EN'}
          </button>
        </header>
        <main className="page-fade">
          <Outlet />
        </main>
      </div>
      <nav className="mobile-tabs card">
        <NavItem to="/" label={t.dashboard} icon={<BarChart3 size={16} />} compact />
        <NavItem to="/new" label={t.newDocument} icon={<FilePlus2 size={16} />} compact />
        <NavItem to="/history" label={t.history} icon={<Files size={16} />} compact />
        <NavItem to="/clients" label={t.clients} icon={<Users size={16} />} compact />
      </nav>
    </div>
  )
}

function NavItem({
  to,
  label,
  icon,
  compact = false,
}: {
  to: string
  label: string
  icon: ReactNode
  compact?: boolean
}) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${compact ? 'compact' : ''}`}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}
