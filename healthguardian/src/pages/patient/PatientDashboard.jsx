import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiHeartPulseLine, RiFileList3Line, RiCalendarLine,
  RiDropLine, RiThermometerLine, RiLungsLine,
  RiAddLine,
} from 'react-icons/ri'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/common/StatCard'
import { FullPageLoader, SkeletonCard } from '../../components/common/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { formatDate, timeAgo, statusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EMPTY_VITAL_FORM = {
  heartRate: '',
  systolic: '',
  diastolic: '',
  temperature: '',
  oxygen: '',
  glucose: '',
  weight: '',
  height: '',
  notes: '',
}

const patientDashboardQuery = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchInterval: 60 * 1000,
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [vitalsModal, setVitalsModal] = useState(false)
  const [vitalForm, setVitalForm] = useState(EMPTY_VITAL_FORM)

  const { data: dash, isLoading, isError } = useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: () => patientService.getDashboard().then(unwrapData),
    ...patientDashboardQuery,
  })

  const addVitalMut = useMutation({
    mutationFn: (payload) => patientService.addVital(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient-dashboard'] })
      qc.invalidateQueries({ queryKey: ['patient-vitals'] })
      toast.success('Vitals recorded')
      setVitalsModal(false)
      setVitalForm(EMPTY_VITAL_FORM)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not save vitals')
    },
  })

  const setVitalField = (field, value) => {
    setVitalForm((f) => ({ ...f, [field]: value }))
  }

  const numberOrUndefined = (value) => {
    if (value === '' || value == null) return undefined
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }

  const handleVitalSubmit = (e) => {
    e.preventDefault()
    const heartRate = numberOrUndefined(vitalForm.heartRate)
    const systolic = numberOrUndefined(vitalForm.systolic)
    const diastolic = numberOrUndefined(vitalForm.diastolic)
    const temperature = numberOrUndefined(vitalForm.temperature)
    const oxygen = numberOrUndefined(vitalForm.oxygen)
    const glucose = numberOrUndefined(vitalForm.glucose)
    const weight = numberOrUndefined(vitalForm.weight)
    const height = numberOrUndefined(vitalForm.height)

    if (
      heartRate == null && systolic == null && diastolic == null &&
      temperature == null && oxygen == null && glucose == null &&
      weight == null && height == null && !vitalForm.notes.trim()
    ) {
      toast.error('Enter at least one vital value')
      return
    }

    const payload = {
      notes: vitalForm.notes.trim(),
      recordedAt: new Date().toISOString(),
    }
    if (heartRate != null) payload.heartRate = { value: heartRate }
    if (systolic != null || diastolic != null) payload.bloodPressure = { systolic, diastolic }
    if (temperature != null) payload.temperature = { value: temperature }
    if (oxygen != null) payload.oxygenSaturation = { value: oxygen }
    if (glucose != null) payload.glucose = { value: glucose, type: 'random' }
    if (weight != null) payload.weight = { value: weight }
    if (height != null) payload.height = { value: height }

    addVitalMut.mutate(payload)
  }

  if (isLoading) return <FullPageLoader message="Loading your health dashboard…" />
  if (isError)   return (
    <div className="flex items-center justify-center h-60">
      <p className="text-danger text-sm">Failed to load dashboard. Please try again.</p>
    </div>
  )

  const stats = dash?.stats ?? {}
  const appointments = dash?.upcomingAppointments ?? []
  const recentRecords = dash?.recentRecords ?? []
  const currentVitals = dash?.currentVitals ?? {}
  const profile = user ?? {}

  const formatList = (value) => {
    if (!Array.isArray(value) || value.length === 0) return 'Not provided'
    const cleaned = value.map(v => String(v).trim()).filter(Boolean)
    return cleaned.length ? cleaned.join(', ') : 'Not provided'
  }

  const formatValue = (value) => {
    const cleaned = String(value ?? '').trim()
    return cleaned || 'Not provided'
  }

  const emergencyContactName = formatValue(profile?.emergencyContact?.name)
  const emergencyContactPhone = formatValue(profile?.emergencyContact?.phone)
  const emergencyContact = (emergencyContactName === 'Not provided' && emergencyContactPhone === 'Not provided')
    ? 'Not provided'
    : `${emergencyContactName} (${emergencyContactPhone})`
  const chronicConditionsText = formatList(profile?.chronicConditions)
  const hasDiabetes = Array.isArray(profile?.chronicConditions)
    && profile.chronicConditions.some(item => String(item).toLowerCase().includes('diabet'))

  const emergencyDetails = [
    { label: 'Blood Group', value: formatValue(profile?.bloodGroup) },
    { label: 'Allergies', value: formatList(profile?.allergies) },
    { label: 'Chronic Conditions', value: chronicConditionsText },
    { label: 'Diabetes', value: hasDiabetes ? 'Yes' : (chronicConditionsText === 'Not provided' ? 'Not provided' : 'No') },
    { label: 'Emergency Contact', value: emergencyContact },
    { label: 'Gender', value: formatValue(profile?.gender) },
    { label: 'Date of Birth', value: profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided' },
  ]

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
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-display font-bold text-white">Current Vitals</h2>
          <button
            type="button"
            onClick={() => setVitalsModal(true)}
            className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <RiAddLine className="text-lg" /> Record vitals
          </button>
        </div>
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
        {/* Emergency Details */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white">Emergency Details</h2>
            <span className="badge badge-info">Critical</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyDetails.map((item) => (
              <div key={item.label} className="rounded-xl border border-surface-border bg-surface-muted px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-white break-words">{item.value}</p>
              </div>
            ))}
          </div>
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

      <Modal
        open={vitalsModal}
        onClose={() => {
          if (!addVitalMut.isPending) setVitalsModal(false)
        }}
        title="Record Vitals"
        size="lg"
      >
        <form onSubmit={handleVitalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Heart rate (bpm)</label>
              <input type="number" min="20" max="250" value={vitalForm.heartRate} onChange={e => setVitalField('heartRate', e.target.value)} className="input" placeholder="72" />
            </div>
            <div>
              <label className="label">Oxygen saturation (%)</label>
              <input type="number" min="50" max="100" value={vitalForm.oxygen} onChange={e => setVitalField('oxygen', e.target.value)} className="input" placeholder="98" />
            </div>
            <div>
              <label className="label">Systolic BP</label>
              <input type="number" min="50" max="260" value={vitalForm.systolic} onChange={e => setVitalField('systolic', e.target.value)} className="input" placeholder="120" />
            </div>
            <div>
              <label className="label">Diastolic BP</label>
              <input type="number" min="30" max="180" value={vitalForm.diastolic} onChange={e => setVitalField('diastolic', e.target.value)} className="input" placeholder="80" />
            </div>
            <div>
              <label className="label">Temperature (F)</label>
              <input type="number" step="0.1" min="90" max="110" value={vitalForm.temperature} onChange={e => setVitalField('temperature', e.target.value)} className="input" placeholder="98.6" />
            </div>
            <div>
              <label className="label">Glucose (mg/dL)</label>
              <input type="number" min="30" max="600" value={vitalForm.glucose} onChange={e => setVitalField('glucose', e.target.value)} className="input" placeholder="100" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" step="0.1" min="1" max="400" value={vitalForm.weight} onChange={e => setVitalField('weight', e.target.value)} className="input" placeholder="70" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" step="0.1" min="30" max="260" value={vitalForm.height} onChange={e => setVitalField('height', e.target.value)} className="input" placeholder="170" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={vitalForm.notes} onChange={e => setVitalField('notes', e.target.value)} rows={3} className="input resize-none" placeholder="Optional notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setVitalsModal(false)} disabled={addVitalMut.isPending} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={addVitalMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {addVitalMut.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save vitals'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
