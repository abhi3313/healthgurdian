import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUploadCloud2Line, RiFileLine, RiDeleteBinLine,
  RiCheckLine, RiImageLine, RiFileTextLine,
} from 'react-icons/ri'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import { fileSizeLabel, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function UploadReport() {
  const inputRef = useRef(null)
  const [files, setFiles]         = useState([])
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedList, setUploadedList] = useState([])
  const [tag, setTag]             = useState('')

  const { data: reports, refetch } = useQuery({
    queryKey: ['patient-reports'],
    queryFn: () => patientService.getReports().then(unwrapData),
  })

  const validate = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) { toast.error(`${f.name}: unsupported type`); return false }
    if (f.size > MAX_SIZE) { toast.error(`${f.name}: file too large (max 10 MB)`); return false }
    return true
  }

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(validate)
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))]
    })
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const handleUpload = async () => {
    if (!files.length) return toast.error('No files selected')
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('report', file)
        fd.append('tag', tag)
        await patientService.uploadReport(fd)
      }
      toast.success(`${files.length} file(s) uploaded!`)
      setFiles([])
      setTag('')
      refetch()
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await patientService.deleteReport(id)
      toast.success('Report deleted')
      refetch()
    } catch {}
  }

  const fileIcon = (type) => type.startsWith('image') ? RiImageLine : RiFileTextLine

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Upload Report</h1>
        <p className="text-slate-400 text-sm mt-1">Upload medical reports, lab results, and scans securely</p>
      </div>

      {/* Drop zone */}
      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        animate={{ borderColor: dragging ? '#3897f0' : '#1e2d42', backgroundColor: dragging ? 'rgba(56,151,240,0.07)' : 'transparent' }}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => addFiles(e.target.files)} />
        <motion.div animate={{ y: dragging ? -6 : 0 }} className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto">
            <RiUploadCloud2Line className="text-3xl text-primary-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}</p>
            <p className="text-slate-500 text-sm mt-1">PDF, JPG, PNG, WEBP — max 10 MB each</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Selected files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{files.length} file(s) selected</h3>
              <button onClick={() => setFiles([])} className="text-xs text-danger hover:text-red-400 transition-colors">Clear all</button>
            </div>

            {/* Tag */}
            <div>
              <label className="label">Label / Tag</label>
              <input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. Blood Test June 2024" className="input text-sm" />
            </div>

            <div className="space-y-2">
              {files.map(f => {
                const Icon = fileIcon(f.type)
                return (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-surface-border"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Icon className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{f.name}</p>
                      <p className="text-xs text-slate-500">{fileSizeLabel(f.size)}</p>
                    </div>
                    <button onClick={() => removeFile(f.name)} className="text-slate-500 hover:text-danger transition-colors p-1">
                      <RiDeleteBinLine />
                    </button>
                  </motion.div>
                )
              })}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {uploading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
              ) : (
                <><RiUploadCloud2Line className="text-lg" /> Upload {files.length} File(s)</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded reports */}
      <div>
        <h2 className="font-display font-bold text-white mb-3">Previously Uploaded Reports</h2>
        {!reports?.reports?.length ? (
          <div className="card text-center py-12 text-slate-600 text-sm">No reports uploaded yet</div>
        ) : (
          <div className="space-y-3">
            {reports.reports.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card-hover flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                  <RiCheckLine className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{r.filename ?? r.name}</p>
                  <p className="text-xs text-slate-500">{r.tag ?? 'Report'} · {formatDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                      <RiFileLine />
                    </a>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this report?')) handleDelete(r._id) }}
                    className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
