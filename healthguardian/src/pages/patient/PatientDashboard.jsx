import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiHeartPulseLine, RiFileList3Line, RiCalendarLine,
  RiDropLine, RiThermometerLine, RiLungsLine,
} from 'react-icons/ri'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { FullPageLoader, SkeletonCard } from '../../components/common/LoadingSpinner'
import { formatDate, timeAgo, statusColor } from '../../utils/helpers'
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

const patientDashboardQuery = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchInterval: 60 * 1000,
}

export default function PatientDashboard() {
  const { data: dash, isLoading, isError } = useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: () => patientService.getDashboard().then(unwrapData),
    ...patientDashboardQuery,
  })

  const { data: vitals } = useQuery({
    queryKey: ['patient-vitals', '7d'],
    queryFn: () => patientService.getVitals('7d').then(unwrapData),
    ...patientDashboardQuery,
  })

  if (isLoading) return <FullPageLoader message="Loading your health dashboard…" />
  if (isError)   return (
    <div className="flex items-center justify-center h-60">
      <p className="text-danger text-sm">Failed to load dashboard. Please try again.</p>
    </div>
  )

  const stats = dash?.stats ?? {}
  const appointments = dash?.upcomingAppointments ?? []
  const recentRecords = dash?.recentRecords ?? []
  const vitalsData = vitals?.chart ?? []
  const currentVitals = dash?.currentVitals ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Health Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Track and manage your personal health records</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Records"     value={stats.totalRecords   ?? 0} icon={RiFileList3Line}   color="blue"   delay={0}    to="/patient/records" />
        <StatCard title="Appointments"      value={stats.appointments   ?? 0} icon={RiCalendarLine}    color="cyan"   delay={0.08} to="/patient/appointments" />
        <StatCard title="Active Prescriptions" value={stats.prescriptions ?? 0} icon={RiHeartPulseLine} color="green"  delay={0.16} to="/patient/prescriptions" />
        <StatCard title="Reports Uploaded"  value={stats.reports        ?? 0} icon={RiFileList3Line}   color="orange" delay={0.24} to="/patient/upload" />
      </div>

      {/* Current Vitals */}
      <div>
        <h2 className="font-display font-bold text-white mb-3">Current Vitals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Heart Rate',   value: currentVitals.heartRate,    unit: 'bpm',  icon: RiHeartPulseLine,  color: 'text-danger' },
            { label: 'Blood Pressure',value: currentVitals.bloodPressure,unit: 'mmHg', icon: RiDropLine,        color: 'text-primary-400' },
            { label: 'Temperature',  value: currentVitals.temperature,  unit: '°F',   icon: RiThermometerLine, color: 'text-warning' },
            { label: 'Oxygen Sat.',  value: currentVitals.oxygen,       unit: '%',    icon: RiLungsLine,        color: 'text-accent' },
            { label: 'Glucose',      value: currentVitals.glucose,      unit: 'mg/dL',icon: RiDropLine,        color: 'text-success' },
          ].map(v => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card text-center"
            >
              <v.icon className={`text-2xl mx-auto mb-2 ${v.color}`} />
              <p className="text-xl font-display font-bold text-white">
                {v.value ?? '—'}
              </p>
              <p className="text-xs text-slate-500">{v.unit}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{v.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts + Appointments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Vitals Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white">Heart Rate – Last 7 Days</h2>
            <span className="badge badge-info">Live</span>
          </div>
          {vitalsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={vitalsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3897f0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3897f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2d42" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#3897f0" strokeWidth={2} fill="url(#hrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-600 text-sm">No vitals data yet</div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <h2 className="font-display font-bold text-white mb-4">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <RiCalendarLine className="text-3xl text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt, i) => (
                <motion.div
                  key={apt._id ?? i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-surface-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex flex-col items-center justify-center shrink-0">
                    <p className="text-primary-400 text-xs font-bold leading-none">{formatDate(apt.date, 'dd')}</p>
                    <p className="text-primary-500 text-[9px] uppercase">{formatDate(apt.date, 'MMM')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{apt.doctorName ?? 'Doctor'}</p>
                    <p className="text-xs text-slate-500 truncate">{apt.reason ?? 'General Checkup'}</p>
                    <span className={clsx('badge mt-1', statusColor(apt.status))}>{apt.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white">Recent Health Records</h2>
          <a href="/patient/records" className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors">View all →</a>
        </div>
        {recentRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-sm">No records yet. Add your first health record.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Record Type', 'Description', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {recentRecords.map((r, i) => (
                  <motion.tr
                    key={r._id ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-white">{r.type}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{r.description}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(r.createdAt)}</td>
                    <td className="py-3 px-3">
                      <span className={clsx('badge', statusColor(r.status ?? 'active'))}>{r.status ?? 'active'}</span>
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
