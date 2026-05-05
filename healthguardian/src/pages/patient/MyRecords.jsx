import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiAddLine, RiSearchLine, RiFilterLine,
  RiFileList3Line, RiDeleteBinLine, RiEditLine,
  RiDownloadLine, RiCloseLine,
} from 'react-icons/ri'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import { RECORD_TYPES } from '../../utils/constants'
import { formatDate, statusColor } from '../../utils/helpers'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EMPTY_FORM = { type: '', description: '', notes: '', date: '' }

export default function MyRecords() {
  const qc = useQueryClient()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [modal, setModal]       = useState(false)
  const [editRecord, setEdit]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['patient-records'],
    queryFn: () => patientService.getRecords().then(unwrapData),
  })

  const invalidateRecords = () => {
    qc.invalidateQueries({ queryKey: ['patient-records'] })
    qc.invalidateQueries({ queryKey: ['patient-dashboard'] })
  }

  const addMut = useMutation({
    mutationFn: (payload) => patientService.addRecord(payload),
    onSuccess: () => {
      invalidateRecords()
      toast.success('Record added!')
      closeModal()
    },
  })

  const delMut = useMutation({
    mutationFn: (id) => patientService.deleteRecord(id),
    onSuccess: () => {
      invalidateRecords()
      toast.success('Record deleted')
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => patientService.updateRecord(id, data),
    onSuccess: () => {
      invalidateRecords()
      toast.success('Record updated!')
      closeModal()
    },
  })

  const openAdd = () => { setEdit(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (r) => { setEdit(r); setForm({ type: r.type, description: r.description, notes: r.notes ?? '', date: r.date ?? '' }); setModal(true) }
  const closeModal = () => { setModal(false); setEdit(null); setForm(EMPTY_FORM) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.type || !form.description) return toast.error('Type and description are required')
    if (editRecord) {
      updateMut.mutate({ id: editRecord._id, data: form })
    } else {
      addMut.mutate(form)
    }
  }

  const records = data?.records ?? []
  const filtered = records.filter(r => {
    const matchSearch = r.description?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.type === filter
    return matchSearch && matchFilter
  })

  if (isLoading) return <FullPageLoader message="Loading records…" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Health Records</h1>
          <p className="text-slate-400 text-sm mt-1">{records.length} total records</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={openAdd} className="btn-primary flex items-center gap-2">
          <RiAddLine className="text-lg" /> Add Record
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records…" className="input pl-10" />
        </div>
        <div className="relative">
          <RiFilterLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input pl-10 pr-8 min-w-[180px]">
            <option value="all">All Types</option>
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Records grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <RiFileList3Line className="text-5xl text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold">No records found</p>
          <p className="text-slate-600 text-sm mt-1">Add your first health record to get started</p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                      <RiFileList3Line className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{r.type}</p>
                      <p className="text-xs text-slate-500">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <span className={clsx('badge', statusColor(r.status ?? 'active'))}>{r.status ?? 'active'}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{r.description}</p>
                {r.doctor && (
                  <p className="text-xs text-primary-400 mt-2 font-medium">
                    From Dr. {r.doctor?.name ?? 'your physician'}
                  </p>
                )}
                {r.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-1">📝 {r.notes}</p>}
                {!r.doctor && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-400 transition-colors">
                      <RiEditLine /> Edit
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this record?')) delMut.mutate(r._id) }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-danger transition-colors ml-auto"
                    >
                      <RiDeleteBinLine /> Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editRecord ? 'Edit Record' : 'Add Health Record'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Record Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input" required>
              <option value="">Select type</option>
              {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Describe the health record…"
              className="input resize-none" required
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Additional notes (optional)"
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={addMut.isPending || updateMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {(addMut.isPending || updateMut.isPending)
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : editRecord ? 'Update' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
