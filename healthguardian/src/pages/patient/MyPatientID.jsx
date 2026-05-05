import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiShieldCheckLine, RiFileCopyLine, RiCheckLine,
  RiHeartPulseFill, RiLockLine, RiGroupLine,
  RiTimeLine, RiEyeLine,
} from 'react-icons/ri'
import { accessService } from '../../services/accessService'
import { unwrapData } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FullPageLoader } from '../../components/common/LoadingSpinner'

export default function MyPatientID() {
  const { user }           = useAuth()
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['my-patient-id'],
    queryFn: () => accessService.getMyPatientId().then(unwrapData),
  })

  const patientId = data?.patientUniqueId ?? '—'

  const copyId = () => {
    navigator.clipboard.writeText(patientId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <FullPageLoader message="Fetching your Patient ID…" />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">My Patient ID</h1>
        <p className="text-slate-400 text-sm mt-1">Share this ID with doctors so they can request access to your records.</p>
      </div>

      {/* ID Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #1560c8 0%, #0f1623 50%, #00b89c 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <RiHeartPulseFill className="text-2xl text-accent" />
            <span className="font-display font-bold text-lg tracking-wide">HealthGuardian</span>
          </div>
          <span className="text-xs bg-white/10 border border-white/20 px-3 py-1 rounded-full font-semibold tracking-widest uppercase">
            Patient Card
          </span>
        </div>

        {/* Patient name */}
        <div className="relative z-10 mb-6">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Patient Name</p>
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-sm text-white/60">{user?.email}</p>
        </div>

        {/* Patient ID */}
        <div className="relative z-10">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Unique Patient ID</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-3xl font-bold tracking-[0.2em] text-accent">
              {patientId}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyId}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              title="Copy ID"
            >
              {copied
                ? <RiCheckLine className="text-accent text-xl" />
                : <RiFileCopyLine className="text-white text-xl" />
              }
            </motion.button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-accent mt-2"
            >
              ✓ Copied to clipboard!
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center gap-2">
          <RiShieldCheckLine className="text-accent" />
          <p className="text-xs text-white/50">Share only with trusted healthcare providers</p>
        </div>
      </motion.div>

      {/* How it works */}
      <div className="card">
        <h2 className="font-display font-bold text-white mb-5">How Access Control Works</h2>
        <div className="space-y-4">
          {[
            {
              icon: RiGroupLine,
              color: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
              title: 'Doctor requests access',
              desc:  'A doctor enters your unique Patient ID to send you an access request.',
            },
            {
              icon: RiShieldCheckLine,
              color: 'text-accent bg-accent/10 border-accent/20',
              title: 'You approve or reject',
              desc:  'You decide who can access your health records. You are always in control.',
            },
            {
              icon: RiEyeLine,
              color: 'text-success bg-success/10 border-success/20',
              title: 'Doctor views your data',
              desc:  'Once approved, the doctor can view your records, reports, and prescriptions.',
            },
            {
              icon: RiLockLine,
              color: 'text-danger bg-danger/10 border-danger/20',
              title: 'Revoke anytime',
              desc:  'You can revoke a doctor\'s access at any time. They immediately lose access.',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-surface-muted border border-surface-border"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}>
                <step.icon className="text-lg" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
