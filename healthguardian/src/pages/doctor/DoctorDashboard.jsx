import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiGroupLine, RiCalendarLine, RiFileList3Line,
  RiHeartPulseLine, RiTimeLine, RiCheckLine,
} from 'react-icons/ri'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { doctorService } from '../../services/doctorService'
import { unwrapData } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, getInitials, getAvatarColor, statusColor, timeAgo } from '../../utils/helpers'
import clsx from 'clsx'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs shadow-card">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const STATUS_ICON = {
  confirmed: { icon: RiCheckLine,   cls: 'text-success bg-success/10 border-success/20' },
  pending:   { icon: RiTimeLine,    cls: 'text-warning bg-warning/10 border-warning/20' },
  completed: { icon: RiCheckLine,   cls: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
  cancelled: { icon: RiTimeLine,    cls: 'text-danger bg-danger/10 border-danger/20' },
}

const doctorDashboardQuery = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchInterval: 60 * 1000,
}

export default function DoctorDashboard() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => doctorService.getDashboard().then(unwrapData),
    ...doctorDashboardQuery,
  })

  if (isLoading) return <FullPageLoader message="Loading doctor dashboard…" />

  const stats       = dash?.stats ?? {}
  const appointments = dash?.todayAppointments ?? []
  const recentPts   = dash?.recentPatients ?? []
  const chartData   = dash?.weeklyChart ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Doctor Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your patients and appointments</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Patients"      value={stats.totalPatients   ?? 0} icon={RiGroupLine}       color="blue"   delay={0}    to="/doctor/patients" />
        <StatCard title="Today's Appointments" value={stats.todayAppts     ?? 0} icon={RiCalendarLine}    color="cyan"   delay={0.08} to="/doctor/appointments" />
        <StatCard title="Records Reviewed"    value={stats.recordsReviewed ?? 0} icon={RiFileList3Line}   color="green"  delay={0.16} to="/doctor/patients" />
        <StatCard title="Active Prescriptions" value={stats.prescriptions  ?? 0} icon={RiHeartPulseLine} color="orange" delay={0.24} to="/doctor/patients" />
      </div>

      {/* Charts + Today's Appointments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="xl:col-span-2 card">
          <h2 className="font-display font-bold text-white mb-5">Weekly Appointments</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="40%">
                <CartesianGrid stroke="#1e2d42" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56,151,240,0.07)' }} />
                <Bar dataKey="appointments" name="Appointments" fill="#3897f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-600 text-sm">No appointment data yet</div>
          )}
        </div>

        {/* Today's Appointments */}
        <div className="card overflow-hidden">
          <h2 className="font-display font-bold text-white mb-4">Today's Schedule</h2>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <RiCalendarLine className="text-3xl text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-64 no-scrollbar">
              {appointments.map((apt, i) => {
                const s = STATUS_ICON[apt.status] ?? STATUS_ICON.pending
                return (
                  <motion.div
                    key={apt._id ?? i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-surface-border"
                  >
                    <div className={clsx('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', s.cls)}>
                      <s.icon className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{apt.patientName ?? 'Patient'}</p>
                      <p className="text-xs text-slate-500">{apt.time ?? '—'} · {apt.reason ?? 'Checkup'}</p>
                    </div>
                    <span className={clsx('badge', statusColor(apt.status))}>{apt.status}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white">Recent Patients</h2>
          <a href="/doctor/patients" className="text-primary-400 hover:text-primary-300 text-sm font-semibold">View all →</a>
        </div>
        {recentPts.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-8">No patients yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Patient', 'Age', 'Blood Group', 'Last Visit', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {recentPts.map((p, i) => (
                  <motion.tr
                    key={p._id ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0', getAvatarColor(p.name))}>
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{p.age ?? '—'}</td>
                    <td className="py-3 px-3 text-slate-400">{p.bloodGroup ?? '—'}</td>
                    <td className="py-3 px-3 text-slate-500">{p.lastVisit ? timeAgo(p.lastVisit) : '—'}</td>
                    <td className="py-3 px-3">
                      <span className={clsx('badge', statusColor(p.status ?? 'active'))}>{p.status ?? 'active'}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
