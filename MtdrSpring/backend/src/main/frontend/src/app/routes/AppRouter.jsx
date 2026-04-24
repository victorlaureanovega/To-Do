import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppProviders from '../providers/AppProviders'
import AppShell from '../layout/AppShell'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'
import { getRoleHomePath } from '../../utils/authRoutes'
import AnalyticsPage from '../../pages/AnalyticsPage'
import DeveloperAnalyticsPage from '../../pages/DeveloperAnalyticsPage'
import DeveloperWorkspacePage from '../../pages/DeveloperWorkspacePage'
import LoginPage from '../../pages/LoginPage'
import ManagerOverviewPage from '../../pages/ManagerOverviewPage'
import NotFoundPage from '../../pages/NotFoundPage'
import TaskDetailPage from '../../pages/TaskDetailPage'

function RoleHomeRedirect() {
  const { role } = useAuth()

  return <Navigate to={getRoleHomePath(role)} replace />
}

export default function AppRouter() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={(
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            )}
          >
            <Route path="/home" element={<RoleHomeRedirect />} />
            <Route path="/developer" element={<Navigate to="/developer/tasks" replace />} />
            <Route path="/developer/tasks" element={<DeveloperWorkspacePage view="tasks" />} />
            <Route path="/developer/dashboard" element={<DeveloperAnalyticsPage />} />
            <Route path="/developer/ai" element={<DeveloperWorkspacePage view="ai" />} />

            <Route path="/manager" element={<Navigate to="/manager/tasks" replace />} />
            <Route path="/manager/tasks" element={<ManagerOverviewPage />} />
            <Route path="/manager/dashboard" element={<AnalyticsPage />} />

            <Route path="/developer/kpis" element={<Navigate to="/developer/dashboard" replace />} />
            <Route path="/developer/ai-prioritization" element={<Navigate to="/developer/ai" replace />} />
            <Route path="/manager/overview" element={<Navigate to="/manager/tasks" replace />} />
            <Route path="/analytics" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
