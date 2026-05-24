import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowLeftLine, RiMailLine, RiMoonLine, RiSunLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import Logo from '../../components/common/Logo'
import { useTheme } from '../../context/ThemeContext'
import { forgotPassword } from '../../services/authService'

const GOOGLE_RESET_MESSAGE = 'This account uses Google Sign-In. Please reset your password through your Google Account.'

export default function ForgotPassword() {
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setSubmitting(true)
    try {
      const res = await forgotPassword(email.trim())
      const safeMessage = res?.message || 'If this email exists, reset instructions have been sent.'
      setMessage(safeMessage)
      if (safeMessage === GOOGLE_RESET_MESSAGE) {
        toast.error(safeMessage)
      } else {
        toast.success(safeMessage)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not send reset instructions right now.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'theme-dark' : 'theme-light light-auth'}`}>
      <button
        aria-label="Toggle theme"
        className={`absolute right-4 top-4 z-20 rounded-full p-2.5 transition-colors ${
          isDark
            ? 'border border-surface-border bg-surface-card/80 text-slate-300 hover:bg-surface-muted'
            : 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100'
        }`}
        onClick={toggleTheme}
        type="button"
      >
        <span className="text-base">{isDark ? <RiSunLine /> : <RiMoonLine />}</span>
      </button>

      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link
            to="/"
            aria-label="Go to HealthGuardian landing page"
            className="inline-flex rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-glow mb-4 transition-transform hover:scale-105">
              <Logo className="w-10 h-10" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">HealthGuardian</h1>
          <p className="text-slate-400 mt-1 text-sm">Reset your local account password</p>
        </div>

        <div className="card p-8">
          <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300">
            <RiArrowLeftLine />
            Back to sign in
          </Link>

          <h2 className="font-display text-xl font-bold text-white mb-2">Forgot password</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter the email for your HealthGuardian password account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input pl-10 ${error ? 'border-danger focus:ring-danger/30' : ''}`}
                  autoComplete="email"
                />
              </div>
              {error && <p className="text-danger text-xs mt-1">{error}</p>}
            </div>

            {message && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                message === GOOGLE_RESET_MESSAGE
                  ? 'border-warning/30 bg-warning/10 text-warning'
                  : 'border-success/30 bg-success/10 text-success'
              }`}>
                {message}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Send reset link'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
