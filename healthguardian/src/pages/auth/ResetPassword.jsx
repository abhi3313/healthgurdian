import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiArrowLeftLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiMoonLine,
  RiSunLine,
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import Logo from '../../components/common/Logo'
import { useTheme } from '../../context/ThemeContext'
import { resetPassword } from '../../services/authService'

const GOOGLE_RESET_MESSAGE = 'This account uses Google Sign-In. Please reset your password through your Google Account.'

function getPasswordError(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must include a number'
  return ''
}

export default function ResetPassword() {
  const { token } = useParams()
  const { isDark, toggleTheme } = useTheme()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const passwordHint = useMemo(() => getPasswordError(form.password), [form.password])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    const passwordError = getPasswordError(form.password)
    if (passwordError) e.password = passwordError
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!token) e.token = 'Reset link is invalid or has expired.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setMessage('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await resetPassword(token, form)
      const msg = res?.message || 'Password reset successfully. You can now sign in.'
      setMessage(msg)
      setDone(true)
      toast.success(msg)
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset link is invalid or has expired.'
      setMessage(msg)
      if (msg === GOOGLE_RESET_MESSAGE) {
        toast.error(GOOGLE_RESET_MESSAGE)
      } else {
        toast.error(msg)
      }
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
          <p className="text-slate-400 mt-1 text-sm">Choose a new password</p>
        </div>

        <div className="card p-8">
          <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300">
            <RiArrowLeftLine />
            Back to sign in
          </Link>

          <h2 className="font-display text-xl font-bold text-white mb-2">Reset password</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter a strong password for your HealthGuardian account.
          </p>

          {errors.token && (
            <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {errors.token}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="At least 8 characters"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-danger focus:ring-danger/30' : ''}`}
                  autoComplete="new-password"
                  disabled={done}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-danger text-xs mt-1">{errors.password}</p>
              ) : (
                <p className="text-slate-500 text-xs mt-1">{passwordHint || 'Password strength looks good.'}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Repeat new password"
                  className={`input pl-10 ${errors.confirmPassword ? 'border-danger focus:ring-danger/30' : ''}`}
                  autoComplete="new-password"
                  disabled={done}
                />
              </div>
              {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {message && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                done
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-danger/30 bg-danger/10 text-danger'
              }`}>
                {message}
              </div>
            )}

            {done ? (
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                Sign in
              </Link>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Reset password'}
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}
