import { useAuth } from '../../context/AuthContext'
import DashboardLayout from './DashboardLayout'
import DoctorPendingApproval from '../../pages/doctor/DoctorPendingApproval'

/** Doctors who are not yet approved see a waiting screen (no doctor API calls → no 403 spam). */
export default function DoctorLayoutGate() {
  const { user } = useAuth()
  // Only doctors with explicit isApproved === true may use doctor APIs (middleware requireApproved).
  if (user?.role === 'doctor' && user?.isApproved !== true) {
    return <DoctorPendingApproval />
  }
  return <DashboardLayout role="doctor" />
}
