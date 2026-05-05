import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiTimeLine, RiCheckLine, RiCloseLine, RiDeleteBinLine, RiRefreshLine,
  RiShieldCheckLine, RiGroupLine, RiEyeLine,
  RiHeartPulseLine, RiFileList3Line, RiLockLine,
} from 'react-icons/ri'
import { accessService } from '../../services/accessService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, timeAgo, getInitials, getAvatarColor } from '../../utils/helpers'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'badge-warning', icon: RiTimeLine },
  approved: { label: 'Approved', cls: 'badge-success', icon: RiCheckLine },
  rejected: { label: 'Rejected', cls: 'badge-danger',  icon: RiCloseLine },
  revoked:  { label: 'Revoked',  cls: 'badge-danger',  icon: RiLockLine  },
}

// ── Approved Patient Detail Modal ─────────────────────────
function PatientDataModal({ open, onClose, patientId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['approved-patient-data', patientId],
    queryFn:  () => accessService.getApprovedPatientData(patientId).then(unwrapData),
    enabled:  !!patientId && open,
  })

  const d = data ?? {}
  const patient       = d.patient ?? {}
  const records       = d.records ?? []
  const reports       = d.reports ?? []
  const prescriptions = d.prescriptions ?? []
  const access        = d.access ?? {}

  return (
    <Modal open={open} onClose={onClose} title="Patient Health Records" size="xl">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">

          {/* Patient profile */}
          <div className="flex items-center gap-4 p-4 bg-surface-muted rounded-xl border border-surface-border">
            <div className={clsx('w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0', getAvatarColor(patient.name ?? ''))}>
              {getInitials(patient.name ?? '')}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg">{patient.name}</p>
              <p className="text-sm text-slate-400">{patient.email}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {patient.patientUniqueId && <span className="badge badge-info font-mono">{patient.patientUniqueId}</span>}
                {patient.bloodGroup      && <span className="badge badge-danger">{patient.bloodGroup}</span>}
                {patient.age             && <span className="badge badge-info">{patient.age} yrs</span>}
              </div>
            </div>
            {access.permissions && (
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Access since</p>
                <p className="text-sm font-semibold text-success">{formatDate(access.approvedAt)}</p>
              </div>
            )}
          </div>

          {/* Permissions granted */}
          {access.permissions && (
            <div>
              <p className="label mb-2">Your Permissions</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(access.permissions).map(([k, v]) => (
                  <span key={k} className={clsx('badge', v ? 'badge-success' : 'badge-danger')}>
                    {v ? <RiCheckLine /> : <RiCloseLine />}
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Records */}
          <div>
            <p className="label mb-2">Health Records ({records.length})</p>
            {records.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-4">No records found</p>
            ) : (
              <div className="space-y-2">
                {records.slice(0, 10).map((r, i) => (
                  <div key={r._id ?? i} className="flex items-start gap-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
                    <RiHeartPulseLine className="text-primary-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{r.type}</p>
                        <span className="badge badge-info text-[10px]">{r.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{r.description}</p>
                      <p className="text-xs text-slate-600 mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          {reports.length > 0 && (
            <div>
              <p className="label mb-2">Uploaded Reports ({reports.length})</p>
              <div className="space-y-2">
                {reports.map((r, i) => (
                  <div key={r._id ?? i} className="flex items-center gap-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
                    <RiFileList3Line className="text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.originalName}</p>
                      <p className="text-xs text-slate-500">{r.tag} · {formatDate(r.createdAt)}</p>
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 font-semibold px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-all">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {prescriptions.length > 0 && (
            <div>
              <p className="label mb-2">Prescriptions ({prescriptions.length})</p>
              <div className="space-y-2">
                {prescriptions.map((rx, i) => (
                  <div key={rx._id ?? i} className="p-3 bg-surface-muted rounded-xl border border-surface-border">
                    <p className="text-sm font-semibold text-white">{rx.diagnosis}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rx.medications?.map((m, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-300 rounded-lg">
                          {m.name} {m.dosage}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{formatDate(rx.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function MyAccessRequests() {
  const qc                        = useQueryClient()
  const [tab, setTab]             = useState('requests')
  const [filter, setFilter]       = useState('all')
  const [viewPatient, setViewPt]  = useState(null)

  /** Cross-user updates (patient approves elsewhere) are invisible to React Query defaults
   * (5m staleTime + refetchOnWindowFocus: false in main.jsx). These options keep this page fresh.
   * refetchInterval is skipped while the tab is hidden unless refetchIntervalInBackground is true
   * (see queryObserver: interval runs only when focused OR this flag). */
  const accessQueryOpts = {
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: true,
  }

  const { data: reqData, isLoading: loadingReq, refetch: refetchReq } = useQuery({
    queryKey: ['doctor-access-requests'],
    queryFn:  () => accessService.getMyRequests().then(unwrapData),
    ...accessQueryOpts,
  })

  const { data: aptData, isLoading: loadingApt, refetch: refetchApt } = useQuery({
    queryKey: ['doctor-approved-patients'],
    queryFn:  () => accessService.getApprovedPatients().then(unwrapData),
    ...accessQueryOpts,
  })

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      qc.invalidateQueries({ queryKey: ['doctor-access-requests'] })
      qc.invalidateQueries({ queryKey: ['doctor-approved-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [qc])

  const withdrawMut = useMutation({
    mutationFn: (id) => accessService.withdrawRequest(id),
    onSuccess:  () => {
      toast.success('Request withdrawn')
      qc.invalidateQueries({ queryKey: ['doctor-access-requests'] })
      qc.invalidateQueries({ queryKey: ['doctor-approved-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
    },
  })

  const allRequests    = reqData?.requests ?? []
  const approvedPts    = aptData?.patients ?? []

  const filteredReqs = filter === 'all'
    ? allRequests
    : allRequests.filter(r => r.status === filter)

  const counts = {
    pending:  allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
    revoked:  allRequests.filter(r => r.status === 'revoked').length,
  }

  const refreshAll = () => {
    refetchReq()
    refetchApt()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Access Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Track all your patient access requests and view approved patient records.</p>
        </div>
        <button
          type="button"
          onClick={() => refreshAll()}
          className="btn-ghost shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-slate-300 hover:text-white hover:bg-surface-muted"
        >
          <RiRefreshLine className={clsx((loadingReq || loadingApt) && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 p-1 bg-surface-muted border border-surface-border rounded-xl w-fit">
        {[
          { key: 'requests', label: `Requests (${allRequests.length})`, icon: RiTimeLine },
          { key: 'patients', label: `Approved Patients (${approvedPts.length})`, icon: RiGroupLine },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-primary-600 text-white shadow-glow-blue' : 'text-slate-400 hover:text-white'
            )}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Requests ─────────────────────────────── */}
      {tab === 'requests' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all',      label: `All (${allRequests.length})` },
              { key: 'pending',  label: `Pending (${counts.pending})` },
              { key: 'approved', label: `Approved (${counts.approved})` },
              { key: 'rejected', label: `Rejected (${counts.rejected})` },
              { key: 'revoked',  label: `Revoked (${counts.revoked})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                  filter === f.key
                    ? 'bg-primary-600/20 border-primary-500/40 text-primary-300'
                    : 'bg-surface-muted border-surface-border text-slate-400 hover:text-white'
                )}>
                {f.label}
              </button>
            ))}
          </div>

          {loadingReq ? <FullPageLoader message="Loading requests…" /> :
          filteredReqs.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <RiShieldCheckLine className="text-5xl text-slate-700 mb-4" />
              <p className="text-slate-400 font-semibold">No requests found</p>
              <p className="text-slate-600 text-sm mt-1">Use "Request Patient Access" to send your first request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredReqs.map((req, i) => {
                  const patient =
                    typeof req.patient === 'object' && req.patient !== null ? req.patient : {}
                  const patientViewId =
                    typeof req.patient === 'string'
                      ? req.patient
                      : patient._id ?? null
                  const sc      = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
                  return (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.04 }}
                      className="card-hover flex items-start gap-4"
                    >
                      <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0', getAvatarColor(patient.name ?? ''))}>
                        {getInitials(patient.name ?? 'P')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white">{patient.name ?? 'Unknown'}</p>
                          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-lg">
                            {patient.patientUniqueId ?? req.patientUniqueId}
                          </span>
                          <span className={clsx('badge', sc.cls)}>
                            <sc.icon className="text-[10px]" /> {sc.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{patient.email}</p>
                        {req.requestMessage && (
                          <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-1">
                            Your note: "{req.requestMessage}"
                          </p>
                        )}
                        {req.responseMessage && (
                          <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                            Patient: "{req.responseMessage}"
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                          <span>Requested: {timeAgo(req.requestedAt ?? req.createdAt)}</span>
                          {req.approvedAt && <span>Approved: {formatDate(req.approvedAt)}</span>}
                          {req.rejectedAt && <span>Rejected: {formatDate(req.rejectedAt)}</span>}
                          {req.revokedAt  && <span>Revoked: {formatDate(req.revokedAt)}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'approved' && (
                          <button
                            onClick={() => patientViewId && setViewPt(patientViewId)}
                            className="flex items-center gap-1.5 text-xs btn-primary py-2 px-3"
                          >
                            <RiEyeLine /> View Records
                          </button>
                        )}
                        {req.status === 'pending' && (
                          <button
                            onClick={() => { if (confirm('Withdraw this request?')) withdrawMut.mutate(req._id) }}
                            className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                            title="Withdraw request"
                          >
                            <RiDeleteBinLine />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Approved Patients ─────────────────────── */}
      {tab === 'patients' && (
        <>
          {loadingApt ? <FullPageLoader message="Loading approved patients…" /> :
          approvedPts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <RiGroupLine className="text-5xl text-slate-700 mb-4" />
              <p className="text-slate-400 font-semibold">No approved patients yet</p>
              <p className="text-slate-600 text-sm mt-1">Send access requests and wait for patient approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {approvedPts.map((ap, i) => {
                const p = ap.patient ?? {}
                return (
                  <motion.div
                    key={ap._id ?? i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-hover group cursor-pointer"
                    onClick={() => setViewPt(p._id)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0', getAvatarColor(p.name ?? ''))}>
                        {getInitials(p.name ?? 'P')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.email}</p>
                        <span className="font-mono text-xs text-accent">{p.patientUniqueId}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Blood Group', value: p.bloodGroup || '—' },
                        { label: 'Age',         value: p.age != null ? `${p.age} yrs` : '—' },
                        { label: 'Approved',    value: formatDate(ap.approvedAt) },
                        { label: 'Access',      value: 'Active ✓' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-surface-muted rounded-lg p-2 border border-surface-border">
                          <p className="text-slate-600">{label}</p>
                          <p className="text-slate-300 font-semibold mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-primary-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <RiEyeLine /> Click to view patient records
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Patient data modal */}
      <PatientDataModal
        open={!!viewPatient}
        onClose={() => setViewPt(null)}
        patientId={viewPatient}
      />
    </div>
  )
}
