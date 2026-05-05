import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RiHeartPulseLine } from 'react-icons/ri'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import { formatDate, statusColor } from '../../utils/helpers'
import clsx from 'clsx'

export default function MyPrescriptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => patientService.getPrescriptions().then(unwrapData),
  })

  const prescriptions = data?.prescriptions ?? []

  if (isLoading) return <FullPageLoader message="Loading prescriptions…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Prescriptions</h1>
        <p className="text-slate-400 text-sm mt-1">{prescriptions.length} on file</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <RiHeartPulseLine className="text-5xl text-slate-700 mb-4" />
          <p className="text-slate-400 font-semibold">No prescriptions yet</p>
          <p className="text-slate-600 text-sm mt-1">Your doctor will add prescriptions after visits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx, i) => (
            <motion.div
              key={rx._id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-hover space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Dr. {rx.doctor?.name ?? '—'}</p>
                  <p className="text-xs text-slate-600">{rx.doctor?.specialization ?? ''}</p>
                </div>
                <span className={clsx('badge', statusColor(rx.status ?? 'active'))}>{rx.status ?? 'active'}</span>
              </div>
              {rx.diagnosis && <p className="text-sm text-slate-300"><span className="text-slate-500">Diagnosis:</span> {rx.diagnosis}</p>}
              {rx.medications?.length > 0 && (
                <ul className="text-sm space-y-2 border-t border-surface-border pt-3">
                  {rx.medications.map((m, j) => (
                    <li key={j} className="text-slate-300">
                      <span className="font-medium text-white">{m.name}</span>
                      <span className="text-slate-500"> — {m.dosage}, {m.frequency}, {m.duration}</span>
                      {m.instructions ? <p className="text-xs text-slate-600 mt-0.5">{m.instructions}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-600">Issued {formatDate(rx.createdAt)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
