import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './layout/AppLayout'
import { AuthPage } from './routes/AuthPage'
import { ClientsPage } from './routes/clients/ClientsPage'
import { DashboardPage } from './routes/dashboard/DashboardPage'
import { DocumentEditorPage } from './routes/editor/DocumentEditorPage'
import { HistoryPage } from './routes/history/HistoryPage'

function Guarded() {
  const { session, loading } = useAuth()
  if (loading) return <div className="auth-wrap">Loading...</div>
  if (!session) return <Navigate to="/auth" replace />
  return <AppLayout />
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Guarded />}>
        <Route index element={<DashboardPage />} />
        <Route path="new" element={<DocumentEditorPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="clients" element={<ClientsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
