import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiSendPlaneFill, RiUserLine,
  RiShieldCheckLine, RiIdCardLine, RiHospitalLine,
  RiMedalLine, RiHeartPulseLine, RiTimeLine,
  RiCheckLine, RiCloseLine,
} from 'react-icons/ri'
import { accessService } from '../../services/accessService'
import api, { unwrapData } from '../../services/api'
import { getInitials, getAvatarColor, statusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// search patients by name or email (admin/doctor search endpoint)
const searchPatients = (q) => api.get('/doctor/patients', { params: { search: q, limit: 8 } })

export default function RequestAccess() {
  const qc                        = useQueryClient()
  const [mode, setMode]           = useState('id')      // 'id' | 'search'
  const [patientId, setPatientId] = useState('')
  const [searchQ, setSearchQ]     = useState('')
  const [selected, setSelected]   = useState(null)
  const [message, setMessage]     = useState('')
  const [permissions, setPermissions] = useState({
    viewRecords:         true,
    viewReports:         true,
    addNotes:            true,
    createPrescriptions: true,
  })

  // Live search
  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ['patient-search', searchQ],
    queryFn:  () => searchPatients(searchQ).then(unwrapData),
    enabled:  mode === 'search' && searchQ.trim().length >= 2,
  })

  const requestMut = useMutation({
    mutationFn: (payload) => accessService.requestAccess(payload),
    onSuccess: (r) => {
      toast.success(r.data.message)
      qc.invalidateQueries({ queryKey: ['doctor-access-requests'] })
      qc.invalidateQueries({ queryKey: ['doctor-approved-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
      setPatientId('')
      setSearchQ('')
      setSelected(null)
      setMessage('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Request failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const pid = mode === 'id'
      ? patientId.trim().toUpperCase()
      : selected?.patientUniqueId ?? ''

    if (!pid && mode === 'id') return toast.error('Please enter a Patient ID')
    if (!selected && mode === 'search') return toast.error('Please select a patient first')

    requestMut.mutate({ patientUniqueId: pid, requestMessage: message, permissions })
  }

  const togglePermission = (key) =>
    setPermissions(p => ({ ...p, [key]: !p[key] }))

  const patients = searchData?.patients ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Request Patient Access</h1>
        <p className="text-slate-400 text-sm mt-1">
          Find a patient by their Unique Patient ID or by name/email, then send a consent request.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-surface-muted border border-surface-border rounded-xl">
        {[
          { key: 'id',     label: '🪪 Enter Patient ID', icon: RiIdCardLine },
          { key: 'search', label: '🔍 Search by Name',   icon: RiSearchLine },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setSelected(null); setPatientId(''); setSearchQ('') }}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
              mode === m.key
                ? 'bg-primary-600 text-white shadow-glow-blue'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <m.icon /> {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Mode: Patient ID ──────────────────────────── */}
        {mode === 'id' && (
          <motion.div
            key="id-mode"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label className="label">Patient Unique ID *</label>
            <div className="relative">
              <RiIdCardLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
              <input
                value={patientId}
                onChange={e => setPatientId(e.target.value.toUpperCase())}
                placeholder="e.g.  HG-P-AB3C-D7EF"
                className="input pl-10 font-mono tracking-widest text-accent placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-600"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              Ask the patient to share their Patient ID from their HealthGuardian dashboard.
            </p>
          </motion.div>
        )}

        {/* ── Mode: Search ──────────────────────────────── */}
        {mode === 'search' && (
          <motion.div
            key="search-mode"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="label">Search Patient by Name or Email *</label>
              <div className="relative">
                <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); setSelected(null) }}
                  placeholder="Type name or email (min 2 chars)…"
                  className="input pl-10"
                />
                {searching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Search results */}
            <AnimatePresence>
              {patients.length > 0 && !selected && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-card"
                >
                  {patients.map((p, i) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => { setSelected(p); setSearchQ(p.name) }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors border-b border-surface-border/50 last:border-0 text-left"
                    >
                      <div className={clsx('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0', getAvatarColor(p.name))}>
                        {getInitials(p.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.email}</p>
                      </div>
                      {p.patientUniqueId && (
                        <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-lg shrink-0">
                          {p.patientUniqueId}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected patient chip */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 bg-success/5 border border-success/30 rounded-xl"
              >
                <RiCheckLine className="text-success text-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{selected.name}</p>
                  <p className="text-xs text-slate-500">{selected.email} · {selected.patientUniqueId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setSearchQ('') }}
                  className="text-slate-500 hover:text-danger p-1 rounded-lg transition-colors"
                >
                  <RiCloseLine />
                </button>
              </motion.div>
            )}

            {searchQ.length >= 2 && !searching && patients.length === 0 && !selected && (
              <p className="text-sm text-slate-600 text-center py-4">
                No patients found matching "<span className="text-slate-400">{searchQ}</span>"
              </p>
            )}
          </motion.div>
        )}

        {/* ── Permissions ───────────────────────────────── */}
        <div>
          <label className="label">Access Permissions</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'viewRecords',         label: 'View Health Records', icon: RiHeartPulseLine, desc: 'Read medical records' },
              { key: 'viewReports',         label: 'View Reports',        icon: RiShieldCheckLine, desc: 'Access uploaded files' },
              { key: 'addNotes',            label: 'Add Medical Notes',   icon: RiUserLine,        desc: 'Add clinical notes' },
              { key: 'createPrescriptions', label: 'Create Prescriptions',icon: RiMedalLine,       desc: 'Issue prescriptions' },
            ].map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => togglePermission(p.key)}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                  permissions[p.key]
                    ? 'border-primary-500/50 bg-primary-500/10'
                    : 'border-surface-border bg-surface-muted opacity-60'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  permissions[p.key] ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-border text-slate-600'
                )}>
                  <p.icon className="text-sm" />
                </div>
                <div>
                  <p className={clsx('text-xs font-semibold', permissions[p.key] ? 'text-white' : 'text-slate-500')}>
                    {p.label}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{p.desc}</p>
                </div>
                <div className={clsx(
                  'ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                  permissions[p.key]
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-slate-600'
                )}>
                  {permissions[p.key] && <RiCheckLine className="text-[8px] text-white" />}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Patient can further restrict or revoke any of these permissions after approval.
          </p>
        </div>

        {/* ── Message ───────────────────────────────────── */}
        <div>
          <label className="label">Message to Patient (optional)</label>
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            placeholder="e.g. I am your assigned cardiologist and would like to review your health history…"
            className="input resize-none"
          />
          <p className="text-xs text-slate-600 text-right mt-1">{message.length}/500</p>
        </div>

        {/* ── Submit ─────────────────────────────────────── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={requestMut.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {requestMut.isPending
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><RiSendPlaneFill /> Send Access Request</>
          }
        </motion.button>
      </form>

      {/* Info box */}
      <div className="card border-primary-500/20 bg-primary-500/5">
        <div className="flex items-start gap-3">
          <RiShieldCheckLine className="text-primary-400 text-xl shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-white mb-1">Patient Consent Required</p>
            <p className="text-slate-400 leading-relaxed text-xs">
              The patient will receive your request and must approve it before you gain any access.
              They can revoke access at any time. All access events are logged in the audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
