import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiShieldCheckLine, RiCloseLine, RiTimeLine,
  RiCheckLine, RiGroupLine, RiLockLine, RiUserLine,
  RiHospitalLine, RiMedalLine,
} from 'react-icons/ri'
import { accessService } from '../../services/accessService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, timeAgo, getInitials, getAvatarColor } from '../../utils/helpers'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'badge-warning',  icon: RiTimeLine },
  approved: { label: 'Approved', cls: 'badge-success',  icon: RiCheckLine },
  rejected: { label: 'Rejected', cls: 'badge-danger',   icon: RiCloseLine },
  revoked:  { label: 'Revoked',  cls: 'badge-danger',   icon: RiLockLine  },
}

function DoctorCard({ request, onApprove, onReject, onRevoke }) {
  const doctor = request.doctor ?? {}
  const sc     = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="card-hover"
    >
      {/* Doctor info */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0',
            getAvatarColor(doctor.name ?? '')
          )}>
            {getInitials(doctor.name ?? 'D')}
          </div>
          <div>
            <p className="font-bold text-white">{doctor.name}</p>
            <p className="text-sm text-slate-400">{doctor.specialization || 'General Physician'}</p>
            <p className="text-xs text-slate-600">{doctor.email}</p>
          </div>
        </div>
        <span className={clsx('badge', sc.cls)}>
          <sc.icon className="text-[10px]" /> {sc.label}
        </span>
      </div>

      {/* Doctor details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        {[
          { icon: RiHospitalLine, label: 'Hospital', value: doctor.hospital || 'Not specified' },
          { icon: RiMedalLine,    label: 'Experience', value: doctor.experience ? `${doctor.experience} years` : '—' },
          { icon: RiTimeLine,     label: 'Requested', value: timeAgo(request.requestedAt || request.createdAt) },
          { icon: RiShieldCheckLine, label: 'License', value: doctor.licenseNumber || '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 p-2.5 bg-surface-muted rounded-lg border border-surface-border">
            <Icon className="text-slate-500 shrink-0" />
            <div>
              <p className="text-slate-600">{label}</p>
              <p className="text-slate-300 font-medium truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Request message */}
      {request.requestMessage && (
        <div className="mb-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
          <p className="text-xs text-slate-500 mb-1 font-semibold">Doctor's message:</p>
          <p className="text-sm text-slate-300 italic">"{request.requestMessage}"</p>
        </div>
      )}

      {/* Approved info */}
      {request.status === 'approved' && (
        <div className="mb-4 p-3 bg-success/5 border border-success/20 rounded-xl text-xs text-success">
          <p>✅ Access granted on {formatDate(request.approvedAt)}</p>
          {request.expiresAt && <p className="mt-1">⏳ Expires: {formatDate(request.expiresAt)}</p>}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(request)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <RiCheckLine /> Approve
            </button>
            <button
              onClick={() => onReject(request)}
              className="btn-danger flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <RiCloseLine /> Reject
            </button>
          </>
        )}
        {request.status === 'approved' && (
          <button
            onClick={() => onRevoke(request)}
            className="btn-danger w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <RiLockLine /> Revoke Access
          </button>
        )}
        {['rejected', 'revoked'].includes(request.status) && (
          <p className="text-xs text-slate-600 w-full text-center py-2">
            {request.status === 'rejected' ? 'Request was rejected.' : 'Access has been revoked.'}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function AccessRequests() {
  const qc                     = useQueryClient()
  const [filter, setFilter]    = useState('all')
  const [activeModal, setModal] = useState(null)   // { type: 'approve'|'reject'|'revoke', request }
  const [message, setMessage]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['incoming-requests'],
    queryFn:  () => accessService.getMyDoctors().then(unwrapData),
  })

  const invalidate = () => qc.invalidateQueries(['incoming-requests'])

  const approveMut = useMutation({
    mutationFn: ({ id, msg }) => accessService.approveRequest(id, { message: msg }),
    onSuccess: (r) => { toast.success(r.data.message); invalidate(); closeModal() },
  })
  const rejectMut = useMutation({
    mutationFn: ({ id, msg }) => accessService.rejectRequest(id, { message: msg }),
    onSuccess: (r) => { toast.success(r.data.message); invalidate(); closeModal() },
  })
  const revokeMut = useMutation({
    mutationFn: ({ id, msg }) => accessService.revokeAccess(id, { message: msg }),
    onSuccess: (r) => { toast.success(r.data.message); invalidate(); closeModal() },
  })

  const closeModal = () => { setModal(null); setMessage('') }

  const handleAction = () => {
    const id = activeModal.request._id
    if (activeModal.type === 'approve') approveMut.mutate({ id, msg: message })
    if (activeModal.type === 'reject')  rejectMut.mutate({ id, msg: message })
    if (activeModal.type === 'revoke')  revokeMut.mutate({ id, msg: message })
  }

  const allRequests = data?.requests ?? []
  const filtered    = filter === 'all' ? allRequests : allRequests.filter(r => r.status === filter)

  const pending  = allRequests.filter(r => r.status === 'pending').length
  const approved = allRequests.filter(r => r.status === 'approved').length

  if (isLoading) return <FullPageLoader message="Loading access requests…" />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Doctor Access Control</h1>
          <p className="text-slate-400 text-sm mt-1">Manage which doctors can access your health records</p>
        </div>
        <div className="flex gap-3">
          {pending > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-xl">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              <p className="text-warning text-xs font-bold">{pending} pending</p>
            </div>
          )}
          {approved > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-xl">
              <RiShieldCheckLine className="text-success text-sm" />
              <p className="text-success text-xs font-bold">{approved} active</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all',      label: `All (${allRequests.length})` },
          { key: 'pending',  label: `Pending (${pending})` },
          { key: 'approved', label: `Approved (${approved})` },
          { key: 'rejected', label: 'Rejected' },
          { key: 'revoked',  label: 'Revoked' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
              filter === f.key
                ? 'bg-primary-600/20 border-primary-500/40 text-primary-300'
                : 'bg-surface-muted border-surface-border text-slate-400 hover:text-white'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <RiGroupLine className="text-5xl text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold">No requests found</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter === 'pending'
              ? 'No pending requests. Share your Patient ID with doctors to receive requests.'
              : 'No requests in this category.'}
          </p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(req => (
              <DoctorCard
                key={req._id}
                request={req}
                onApprove={r => { setModal({ type: 'approve', request: r }); setMessage('') }}
                onReject={r  => { setModal({ type: 'reject',  request: r }); setMessage('') }}
                onRevoke={r  => { setModal({ type: 'revoke',  request: r }); setMessage('') }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirm Modal */}
      <Modal
        open={!!activeModal}
        onClose={closeModal}
        title={
          activeModal?.type === 'approve' ? '✅ Approve Doctor Access'
          : activeModal?.type === 'reject'  ? '❌ Reject Access Request'
          : '🔒 Revoke Doctor Access'
        }
      >
        {activeModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-surface-muted rounded-xl border border-surface-border">
              <div className={clsx('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm', getAvatarColor(activeModal.request.doctor?.name ?? ''))}>
                {getInitials(activeModal.request.doctor?.name ?? 'D')}
              </div>
              <div>
                <p className="font-semibold text-white">{activeModal.request.doctor?.name}</p>
                <p className="text-xs text-slate-400">{activeModal.request.doctor?.specialization}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              {activeModal.type === 'approve' && 'Once approved, this doctor can view your health records, reports, and prescriptions.'}
              {activeModal.type === 'reject'  && 'The doctor will be notified that their request was declined.'}
              {activeModal.type === 'revoke'  && 'The doctor will immediately lose access to your health records. This cannot be undone without a new request.'}
            </p>

            <div>
              <label className="label">Message (optional)</label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  activeModal.type === 'approve' ? 'e.g. Welcome! You can now view my records.'
                  : activeModal.type === 'reject' ? 'e.g. I prefer to use my current doctor.'
                  : 'e.g. I no longer wish to share my data.'
                }
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-ghost flex-1 border border-surface-border">
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={approveMut.isPending || rejectMut.isPending || revokeMut.isPending}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all',
                  activeModal.type === 'approve'
                    ? 'btn-primary'
                    : 'btn-danger'
                )}
              >
                {(approveMut.isPending || rejectMut.isPending || revokeMut.isPending)
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : activeModal.type === 'approve' ? 'Approve Access'
                  : activeModal.type === 'reject'  ? 'Reject Request'
                  : 'Revoke Access'
                }
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
