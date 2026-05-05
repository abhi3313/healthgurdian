import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RiCalendarLine, RiUserLine, RiAddLine, RiCloseLine } from 'react-icons/ri'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, statusColor } from '../../utils/helpers'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const APT_TYPES = [
  { value: 'in-person', label: 'In person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'follow-up', label: 'Follow-up' },
]

export default function MyAppointments() {
  const qc = useQueryClient()
  const [bookOpen, setBookOpen] = useState(false)
  const [docSearch, setDocSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [form, setForm] = useState({
    date: '',
    time: '',
    reason: '',
    type: 'in-person',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => patientService.getAppointments().then(unwrapData),
  })

  const { data: doctorsData, isFetching: loadingDocs } = useQuery({
    queryKey: ['patient-doctors-booking', docSearch],
    queryFn: () =>
      patientService
        .getDoctors({ search: docSearch.trim() || undefined, limit: 25 })
        .then(unwrapData),
    enabled: bookOpen,
  })

  const bookMut = useMutation({
    mutationFn: (payload) => patientService.bookAppointment(payload),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Appointment booked')
      qc.invalidateQueries({ queryKey: ['patient-appointments'] })
      qc.invalidateQueries({ queryKey: ['patient-dashboard'] })
      setBookOpen(false)
      setSelectedDoctor(null)
      setDocSearch('')
      setForm({ date: '', time: '', reason: '', type: 'in-person' })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Could not book appointment')
    },
  })

  const cancelMut = useMutation({
    mutationFn: ({ id, reason }) => patientService.cancelAppointment(id, { reason }),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Cancelled')
      qc.invalidateQueries({ queryKey: ['patient-appointments'] })
      qc.invalidateQueries({ queryKey: ['patient-dashboard'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Could not cancel')
    },
  })

  const appointments = data?.appointments ?? []
  const doctors = doctorsData?.doctors ?? []

  const handleBook = (e) => {
    e.preventDefault()
    if (!selectedDoctor?._id) return toast.error('Select a doctor')
    if (!form.date || !form.time || !form.reason.trim()) {
      return toast.error('Date, time, and reason are required')
    }
    const dateIso = /^\d{4}-\d{2}-\d{2}$/.test(form.date)
      ? `${form.date}T12:00:00.000Z`
      : form.date
    bookMut.mutate({
      doctorId: selectedDoctor._id,
      date: dateIso,
      time: form.time,
      reason: form.reason.trim(),
      type: form.type,
    })
  }

  const confirmCancel = (apt) => {
    const reason = window.prompt('Cancel reason (optional):') ?? ''
    if (reason === null) return
    cancelMut.mutate({ id: apt._id, reason })
  }

  if (isLoading) return <FullPageLoader message="Loading appointments…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Appointments</h1>
          <p className="text-slate-400 text-sm mt-1">{appointments.length} in your history (latest first)</p>
        </div>
        <button
          type="button"
          onClick={() => { setBookOpen(true); setSelectedDoctor(null); setDocSearch('') }}
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shrink-0"
        >
          <RiAddLine /> Book appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <RiCalendarLine className="text-5xl text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold">No appointments yet</p>
          <p className="text-slate-600 text-sm mt-1">Book your first visit with an approved doctor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt._id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-hover flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-primary-400 text-sm font-bold leading-none">{formatDate(apt.date, 'dd')}</span>
                  <span className="text-primary-500 text-[10px] uppercase">{formatDate(apt.date, 'MMM')}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{apt.doctor?.name ?? 'Doctor'}</p>
                  <p className="text-sm text-slate-500">{apt.doctor?.specialization ?? apt.doctor?.hospital ?? ''}</p>
                  <p className="text-xs text-slate-600 mt-1">{apt.time ?? '—'} · {apt.reason ?? 'Appointment'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span className={clsx('badge self-start sm:self-center', statusColor(apt.status))}>{apt.status}</span>
                {['pending', 'confirmed'].includes(apt.status) && (
                  <button
                    type="button"
                    onClick={() => confirmCancel(apt)}
                    disabled={cancelMut.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-danger/40 text-danger hover:bg-danger/10"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book an appointment" size="lg">
        <form onSubmit={handleBook} className="space-y-5">
          <div>
            <label className="label">Find doctor</label>
            <input
              value={docSearch}
              onChange={(e) => { setDocSearch(e.target.value); setSelectedDoctor(null) }}
              placeholder="Search by name, email, or specialty (min 2 characters)…"
              className="input"
            />
            <p className="text-xs text-slate-600 mt-1">Leave search empty to see available doctors.</p>
          </div>

          {loadingDocs && bookOpen ? (
            <p className="text-sm text-slate-500">Loading doctors…</p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-surface-border divide-y divide-surface-border">
              {doctors.length === 0 ? (
                <p className="p-4 text-sm text-slate-500 text-center">No doctors match.</p>
              ) : (
                doctors.map((d) => (
                  <button
                    key={d._id}
                    type="button"
                    onClick={() => setSelectedDoctor(d)}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 text-left transition-colors',
                      selectedDoctor?._id === d._id ? 'bg-primary-500/15' : 'hover:bg-surface-muted'
                    )}
                  >
                    <RiUserLine className="text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{d.name}</p>
                      <p className="text-xs text-slate-500 truncate">{d.specialization || '—'} · {d.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedDoctor && (
            <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-sm text-slate-300">
              Selected: <strong className="text-white">{selectedDoctor.name}</strong>
              <button type="button" className="float-right text-slate-500 hover:text-white" onClick={() => setSelectedDoctor(null)}>
                <RiCloseLine />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="input"
            >
              {APT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reason for visit *</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Describe symptoms or purpose…"
              maxLength={500}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setBookOpen(false)} className="btn-ghost flex-1 border border-surface-border">
              Close
            </button>
            <button type="submit" disabled={bookMut.isPending} className="btn-primary flex-1">
              {bookMut.isPending ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
