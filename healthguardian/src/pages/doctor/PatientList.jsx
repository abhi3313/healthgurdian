import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiUserLine, RiEyeLine,
  RiHeartPulseLine, RiShieldCheckLine, RiArrowRightLine,
} from 'react-icons/ri'
import { doctorService } from '../../services/doctorService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, getInitials, getAvatarColor, statusColor, timeAgo } from '../../utils/helpers'
import Modal from '../../components/ui/Modal'
import clsx from 'clsx'

export default function PatientList() {
  const qc                        = useQueryClient()
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: () => doctorService.getPatients().then(unwrapData),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [qc])

  const { data: patientDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['doctor-patient', selected?._id],
    queryFn: () => doctorService.getPatientRecords(selected._id).then(unwrapData),
    enabled: !!selected?._id,
  })

  const patients = data?.patients ?? []
  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openDetail = (p) => { setSelected(p); setModalOpen(true) }

  const emptyList = patients.length === 0

  if (isLoading) return <FullPageLoader message="Loading patients…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Patients</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Everyone you are allowed to care for in this app: patients linked by <span className="text-slate-300">appointments</span> or by <span className="text-slate-300">approved access</span> after you request it. Open a card to review their records and continue care.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} in your list
            {isFetching && !isLoading ? ' · Updating…' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn-ghost shrink-0 px-4 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-slate-300 hover:text-white"
        >
          Refresh list
        </button>
      </div>

      {isError && (
        <div className="card border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          <p className="font-semibold">Could not load patients</p>
          <p className="text-slate-400 mt-1">{error?.message || 'Check that the API is running and you are logged in.'}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="input pl-10" />
      </div>

      {/* Patient cards */}
      {filtered.length === 0 ? (
        emptyList ? (
          <div className="card border-primary-500/20 bg-primary-500/[0.03] p-8 md:p-10">
            <div className="max-w-lg mx-auto text-center">
              <RiUserLine className="text-5xl text-slate-600 mx-auto mb-4" />
              <h2 className="font-display text-lg font-bold text-white mb-2">No patients here yet</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                This page stays empty until <strong className="text-slate-300">at least one</strong> of these is true: you have a <strong className="text-slate-300">scheduled appointment</strong> with them, or they <strong className="text-slate-300">approved</strong> your access request. Then they show up here for diagnosis and record review.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
                <Link
                  to="/doctor/request-access"
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold"
                >
                  <RiShieldCheckLine /> Request patient access
                  <RiArrowRightLine className="text-lg opacity-80" />
                </Link>
                <Link
                  to="/doctor/my-requests"
                  className="btn-ghost flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-surface-border text-sm font-semibold text-slate-300"
                >
                  View my access requests
                </Link>
              </div>
              <p className="text-slate-600 text-xs mt-6">
                After a patient approves, use <strong className="text-slate-500">Refresh list</strong> if they do not appear immediately.
              </p>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <RiSearchLine className="text-5xl text-slate-700 mb-4" />
            <p className="text-slate-400 font-semibold">No name or email matches</p>
            <p className="text-slate-600 text-sm mt-1">Try another search or clear the box to see all {patients.length} patients.</p>
          </div>
        )
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-hover cursor-pointer group"
                onClick={() => openDetail(p)}
              >
                {/* Patient avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0', getAvatarColor(p.name))}>
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                  </div>
                  <span className={clsx('badge', statusColor(p.status ?? 'active'))}>{p.status ?? 'active'}</span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Age',        value: p.age        ?? '—' },
                    { label: 'Blood',      value: p.bloodGroup ?? '—' },
                    { label: 'Records',    value: p.recordCount ?? 0  },
                    { label: 'Last Visit', value: p.lastVisit ? timeAgo(p.lastVisit) : 'Never' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface-muted rounded-lg p-2 border border-surface-border">
                      <p className="text-slate-600 mb-0.5">{label}</p>
                      <p className="text-slate-300 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-primary-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <RiEyeLine /> View patient details
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Patient Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected?.name ?? 'Patient Detail'} size="lg">
        {loadingDetail ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4 p-4 bg-surface-muted rounded-xl border border-surface-border">
              <div className={clsx('w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg', getAvatarColor(selected?.name ?? ''))}>
                {getInitials(selected?.name ?? '')}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{selected?.name}</p>
                <p className="text-slate-500 text-sm">{selected?.email}</p>
                <div className="flex gap-2 mt-1">
                  {selected?.bloodGroup && <span className="badge badge-danger">{selected.bloodGroup}</span>}
                  {selected?.phone     && <span className="badge badge-info">{selected.phone}</span>}
                </div>
              </div>
            </div>

            {/* Records */}
            <div>
              <h3 className="font-display font-bold text-white mb-3">Health Records</h3>
              {!patientDetail?.records?.length ? (
                <p className="text-slate-600 text-sm text-center py-6">No records found</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {patientDetail.records.map((r, i) => (
                    <div key={r._id ?? i} className="flex items-start gap-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
                      <RiHeartPulseLine className="text-primary-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white">{r.type}</p>
                          <span className={clsx('badge', statusColor(r.status ?? 'active'))}>{r.status ?? 'active'}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
