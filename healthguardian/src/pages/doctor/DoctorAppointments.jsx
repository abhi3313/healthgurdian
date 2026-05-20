import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiCalendarLine, RiStethoscopeLine, RiFileList3Line,
  RiHeartPulseLine, RiChat3Line, RiUploadCloud2Line,
} from 'react-icons/ri'
import { doctorService } from '../../services/doctorService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, statusColor } from '../../utils/helpers'
import { RECORD_TYPES } from '../../utils/constants'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EMPTY_RX = {
  diagnosis: '',
  instructions: '',
  medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
}

export default function DoctorAppointments() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // 'record' | 'rx' | 'note' | 'report' | null
  const [ctxApt, setCtxApt] = useState(null)

  const [recordForm, setRecordForm] = useState({ type: 'General Checkup', description: '' })
  const [rxForm, setRxForm] = useState(EMPTY_RX)
  const [noteForm, setNoteForm] = useState({ content: '' })
  const [reportForm, setReportForm] = useState({ file: null, tag: '', description: '', category: 'other' })
  const [notesDraft, setNotesDraft] = useState({}) // aptId -> string for inline doctor notes

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: () => doctorService.getAppointments().then(unwrapData),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => doctorService.updateAppointment(id, payload),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Updated')
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })

  const recordMut = useMutation({
    mutationFn: ({ patientId, payload }) => doctorService.addPatientRecord(patientId, payload),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Record saved')
      closeClinical()
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add record'),
  })

  const rxMut = useMutation({
    mutationFn: ({ patientId, payload }) => doctorService.addPrescription(patientId, payload),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Prescription created')
      closeClinical()
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-dashboard'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add prescription'),
  })

  const noteMut = useMutation({
    mutationFn: ({ patientId, payload }) => doctorService.addNote(patientId, payload),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Note added')
      closeClinical()
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add note'),
  })

  const reportMut = useMutation({
    mutationFn: ({ patientId, formData }) => doctorService.uploadPatientReport(patientId, formData),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Report uploaded')
      closeClinical()
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] })
      qc.invalidateQueries({ queryKey: ['doctor-patients'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not upload report'),
  })

  const appointments = data?.appointments ?? []

  const closeClinical = () => {
    setModal(null)
    setCtxApt(null)
    setRecordForm({ type: 'General Checkup', description: '' })
    setRxForm(EMPTY_RX)
    setNoteForm({ content: '' })
    setReportForm({ file: null, tag: '', description: '', category: 'other' })
  }

  const openClinical = (kind, apt) => {
    setCtxApt(apt)
    setModal(kind)
  }

  const patientId = (apt) =>
    typeof apt?.patient === 'object' && apt.patient?._id
      ? apt.patient._id
      : apt?.patient

  const saveDoctorNotes = (apt) => {
    const id = apt._id
    const doctorNotes = notesDraft[id] ?? ''
    updateMut.mutate({ id, payload: { doctorNotes } })
  }

  const handleRecordSubmit = (e) => {
    e.preventDefault()
    const pid = patientId(ctxApt)
    if (!pid || !recordForm.type || !recordForm.description.trim()) {
      return toast.error('Type and description are required')
    }
    recordMut.mutate({
      patientId: pid,
      payload: { type: recordForm.type, description: recordForm.description.trim() },
    })
  }

  const handleRxSubmit = (e) => {
    e.preventDefault()
    const pid = patientId(ctxApt)
    if (!pid) return toast.error('Missing patient')
    const meds = rxForm.medications.filter((m) => m.name?.trim())
    if (!rxForm.diagnosis.trim() || meds.length === 0) {
      return toast.error('Diagnosis and at least one medication are required')
    }
    rxMut.mutate({
      patientId: pid,
      payload: {
        diagnosis: rxForm.diagnosis.trim(),
        instructions: rxForm.instructions?.trim() || '',
        appointmentId: ctxApt?._id,
        medications: meds.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
        })),
      },
    })
  }

  const handleNoteSubmit = (e) => {
    e.preventDefault()
    const pid = patientId(ctxApt)
    if (!pid || !noteForm.content.trim()) return toast.error('Note content is required')
    noteMut.mutate({ patientId: pid, payload: { content: noteForm.content.trim() } })
  }

  const handleReportSubmit = (e) => {
    e.preventDefault()
    const pid = patientId(ctxApt)
    if (!pid) return toast.error('Missing patient')
    if (!reportForm.file) return toast.error('Choose a report file')

    const formData = new FormData()
    formData.append('report', reportForm.file)
    formData.append('tag', reportForm.tag.trim() || 'Doctor Report')
    formData.append('description', reportForm.description.trim())
    formData.append('category', reportForm.category || 'other')

    reportMut.mutate({ patientId: pid, formData })
  }

  if (isLoading) return <FullPageLoader message="Loading appointments…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Appointments</h1>
        <p className="text-slate-400 text-sm mt-1">{appointments.length} total — manage status and clinical actions</p>
      </div>

      {appointments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <RiCalendarLine className="text-5xl text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt, i) => {
            const pid = patientId(apt)
            const st = apt.status
            return (
              <motion.div
                key={apt._id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="card-hover space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-accent text-sm font-bold leading-none">{formatDate(apt.date, 'dd')}</span>
                      <span className="text-accent/80 text-[10px] uppercase">{formatDate(apt.date, 'MMM')}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{apt.patient?.name ?? 'Patient'}</p>
                      <p className="text-sm text-slate-500">{apt.patient?.email ?? ''}</p>
                      <p className="text-xs text-slate-600 mt-1">{apt.time ?? '—'} · {apt.type ?? 'in-person'} · {apt.reason ?? 'Visit'}</p>
                    </div>
                  </div>
                  <span className={clsx('badge self-start', statusColor(st))}>{st}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {st === 'pending' && (
                    <button
                      type="button"
                      onClick={() => updateMut.mutate({ id: apt._id, payload: { status: 'confirmed' } })}
                      disabled={updateMut.isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-success/15 text-success border border-success/30"
                    >
                      Confirm
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(st) && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateMut.mutate({ id: apt._id, payload: { status: 'completed' } })}
                        disabled={updateMut.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 border border-primary-500/30"
                      >
                        Mark completed
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMut.mutate({ id: apt._id, payload: { status: 'no-show' } })}
                        disabled={updateMut.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-muted text-slate-400 border border-surface-border"
                      >
                        No-show
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMut.mutate({ id: apt._id, payload: { status: 'cancelled' } })}
                        disabled={updateMut.isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-danger border border-danger/30"
                      >
                        Cancel visit
                      </button>
                    </>
                  )}
                </div>

                <div className="text-xs text-slate-600 border-t border-surface-border pt-3 space-y-2">
                  <label className="block text-slate-500 font-semibold">Doctor notes (saved separately)</label>
                  <textarea
                    rows={2}
                    value={notesDraft[apt._id] ?? apt.doctorNotes ?? ''}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [apt._id]: e.target.value }))}
                    placeholder="Internal notes for this visit…"
                    className="input resize-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveDoctorNotes(apt)}
                    disabled={updateMut.isPending}
                    className="text-xs btn-ghost px-3 py-1.5 border border-surface-border"
                  >
                    Save notes
                  </button>
                </div>

                {pid && ['pending', 'confirmed', 'completed'].includes(st) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-border">
                    <button
                      type="button"
                      onClick={() => openClinical('record', apt)}
                      className="flex items-center gap-1.5 text-xs btn-primary py-2 px-3"
                    >
                      <RiFileList3Line /> Add record
                    </button>
                    <button
                      type="button"
                      onClick={() => openClinical('rx', apt)}
                      className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg border border-surface-border text-slate-300 hover:bg-surface-muted"
                    >
                      <RiHeartPulseLine /> Prescription
                    </button>
                    <button
                      type="button"
                      onClick={() => openClinical('note', apt)}
                      className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg border border-surface-border text-slate-300 hover:bg-surface-muted"
                    >
                      <RiChat3Line /> Quick note
                    </button>
                    <button
                      type="button"
                      onClick={() => openClinical('report', apt)}
                      className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg border border-surface-border text-slate-300 hover:bg-surface-muted"
                    >
                      <RiUploadCloud2Line /> Upload report
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        open={modal === 'record'}
        onClose={closeClinical}
        title={
          <span className="flex items-center gap-2">
            <RiStethoscopeLine /> Add health record
          </span>
        }
        size="lg"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">Patient: <strong className="text-white">{ctxApt?.patient?.name}</strong></p>
          <div>
            <label className="label">Type *</label>
            <select
              value={recordForm.type}
              onChange={(e) => setRecordForm((f) => ({ ...f, type: e.target.value }))}
              className="input"
            >
              {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              value={recordForm.description}
              onChange={(e) => setRecordForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="input resize-none"
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={closeClinical} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={recordMut.isPending} className="btn-primary flex-1">Save record</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'rx'} onClose={closeClinical} title="New prescription" size="lg">
        <form onSubmit={handleRxSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">Patient: <strong className="text-white">{ctxApt?.patient?.name}</strong></p>
          <div>
            <label className="label">Diagnosis *</label>
            <input
              value={rxForm.diagnosis}
              onChange={(e) => setRxForm((f) => ({ ...f, diagnosis: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea
              value={rxForm.instructions}
              onChange={(e) => setRxForm((f) => ({ ...f, instructions: e.target.value }))}
              rows={2}
              className="input resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="label">Medication *</label>
            {rxForm.medications.map((m, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) => {
                    const next = [...rxForm.medications]
                    next[idx] = { ...next[idx], name: e.target.value }
                    setRxForm((f) => ({ ...f, medications: next }))
                  }}
                  className="input text-sm"
                />
                <input
                  placeholder="Dosage"
                  value={m.dosage}
                  onChange={(e) => {
                    const next = [...rxForm.medications]
                    next[idx] = { ...next[idx], dosage: e.target.value }
                    setRxForm((f) => ({ ...f, medications: next }))
                  }}
                  className="input text-sm"
                />
                <input
                  placeholder="Frequency"
                  value={m.frequency}
                  onChange={(e) => {
                    const next = [...rxForm.medications]
                    next[idx] = { ...next[idx], frequency: e.target.value }
                    setRxForm((f) => ({ ...f, medications: next }))
                  }}
                  className="input text-sm"
                />
                <input
                  placeholder="Duration"
                  value={m.duration}
                  onChange={(e) => {
                    const next = [...rxForm.medications]
                    next[idx] = { ...next[idx], duration: e.target.value }
                    setRxForm((f) => ({ ...f, medications: next }))
                  }}
                  className="input text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={closeClinical} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={rxMut.isPending} className="btn-primary flex-1">Create prescription</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'note'} onClose={closeClinical} title="Quick clinical note" size="md">
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">Patient: <strong className="text-white">{ctxApt?.patient?.name}</strong></p>
          <textarea
            value={noteForm.content}
            onChange={(e) => setNoteForm({ content: e.target.value })}
            rows={5}
            className="input resize-none"
            placeholder="Note content…"
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={closeClinical} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={noteMut.isPending} className="btn-primary flex-1">Save note</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'report'} onClose={closeClinical} title="Upload patient report" size="md">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">Patient: <strong className="text-white">{ctxApt?.patient?.name}</strong></p>
          <div>
            <label className="label">Report file *</label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setReportForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              className="input file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              required
            />
            <p className="text-xs text-slate-600 mt-1">PDF, JPG, PNG, or WEBP up to the configured upload limit.</p>
          </div>
          <div>
            <label className="label">Tag</label>
            <input
              value={reportForm.tag}
              onChange={(e) => setReportForm((f) => ({ ...f, tag: e.target.value }))}
              className="input"
              placeholder="Lab report, X-Ray, discharge summary"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={reportForm.category}
              onChange={(e) => setReportForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            >
              <option value="lab">Lab</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescription</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={reportForm.description}
              onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Short clinical context for this report"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={closeClinical} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={reportMut.isPending} className="btn-primary flex-1">
              {reportMut.isPending ? 'Uploading...' : 'Upload report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
