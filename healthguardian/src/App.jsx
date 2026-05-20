import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Login             from './pages/auth/Login'
import Register          from './pages/auth/Register'
import PatientDashboard  from './pages/patient/PatientDashboard'
import MyRecords         from './pages/patient/MyRecords'
import UploadReport      from './pages/patient/UploadReport'
import MyPatientID       from './pages/patient/MyPatientID'
import AccessRequests    from './pages/patient/AccessRequests'
import DoctorDashboard   from './pages/doctor/DoctorDashboard'
import PatientList       from './pages/doctor/PatientList'
import RequestAccess     from './pages/doctor/RequestAccess'
import MyAccessRequests  from './pages/doctor/MyAccessRequests'
import MyAppointments    from './pages/patient/MyAppointments'
import MyPrescriptions   from './pages/patient/MyPrescriptions'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import AdminPanel        from './pages/admin/AdminPanel'
import AIChat            from './pages/ai/AIChat'
import Settings          from './pages/settings/Settings'
import DashboardLayout   from './components/common/DashboardLayout'
import DoctorLayoutGate  from './components/common/DoctorLayoutGate'
import LandingPage       from './pages/LandingPage'

function PrivateRoute({ children, roles }) {
  const { user, token, authReady } = useAuth()
  if (!authReady) return <div className="min-h-screen bg-surface" />
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Patient ─────────────────────────────────── */}
      <Route path="/patient" element={
        <PrivateRoute roles={["patient"]}>
          <DashboardLayout role="patient" />
        </PrivateRoute>
      }>
        <Route index           element={<PatientDashboard />} />
        <Route path="records"  element={<MyRecords />} />
        <Route path="upload"   element={<UploadReport />} />
        <Route path="ai-chat"  element={<AIChat />} />
        {/* Access Control */}
        <Route path="my-id"    element={<MyPatientID />} />
        <Route path="access"   element={<AccessRequests />} />
        <Route path="settings" element={<Settings />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="prescriptions" element={<MyPrescriptions />} />
      </Route>

      {/* ── Doctor ──────────────────────────────────── */}
      <Route path="/doctor" element={
        <PrivateRoute roles={["doctor"]}>
          <DoctorLayoutGate />
        </PrivateRoute>
      }>
        <Route index                 element={<DoctorDashboard />} />
        <Route path="patients"       element={<PatientList />} />
        {/* Access Control */}
        <Route path="request-access" element={<RequestAccess />} />
        <Route path="my-requests"    element={<MyAccessRequests />} />
        <Route path="settings"       element={<Settings />} />
        <Route path="appointments"   element={<DoctorAppointments />} />
      </Route>

      {/* ── Admin ───────────────────────────────────── */}
      <Route path="/admin" element={
        <PrivateRoute roles={["admin"]}>
          <DashboardLayout role="admin" />
        </PrivateRoute>
      }>
        <Route index element={<AdminPanel />} />
      </Route>

      {/* ── Fallback ────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
