import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiTimeLine, RiShieldUserLine, RiLogoutBoxRLine } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'

export default function DoctorPendingApproval() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refreshUser().then((u) => {
      if (u?.isApproved) navigate('/doctor', { replace: true })
    })
  }, [refreshUser, navigate])

  useEffect(() => {
    const id = setInterval(() => {
      refreshUser().then((u) => {
        if (u?.isApproved) navigate('/doctor', { replace: true })
      })
    }, 12000)
    return () => clearInterval(id)
  }, [refreshUser, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full card p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center mx-auto">
          <RiTimeLine className="text-3xl text-warning" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-white">Awaiting approval</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Your doctor account is pending review by an administrator. You will get access to the dashboard
            as soon as your account is approved. This page refreshes automatically.
          </p>
        </div>
        <div className="rounded-xl bg-surface-muted border border-surface-border p-4 text-left text-sm">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Signed in as</p>
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-slate-500 text-xs mt-1">{user?.email}</p>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-500 text-left">
          <RiShieldUserLine className="text-lg shrink-0 text-primary-400 mt-0.5" />
          <span>An admin can approve you from <strong className="text-slate-400">Admin Panel → Pending doctors</strong>.</span>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate('/login') }}
          className="btn-ghost w-full flex items-center justify-center gap-2 border border-surface-border"
        >
          <RiLogoutBoxRLine /> Sign out
        </button>
      </motion.div>
    </div>
  )
}
