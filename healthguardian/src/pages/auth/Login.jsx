import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import clsx from 'clsx'
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { sendOtp } from '../../services/authService'
import toast from 'react-hot-toast'
import Logo from '../../components/common/Logo'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const { login, loginWithOtp, loginWithGoogle, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mode, setMode]         = useState('password')
  const [form, setForm]         = useState({ email: '', password: '' })
  const [otpCode, setOtpCode]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [otpSending, setOtpSending] = useState(false)

  const goHome = (user) => {
    const routes = { patient: '/patient', doctor: '/doctor', admin: '/admin' }
    navigate(routes[user.role] ?? '/login')
  }

  const validatePassword = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateOtp = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!otpCode || otpCode.trim().length < 6) e.code = 'Enter the 6-digit code'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePasswordSubmit = async (ev) => {
    ev.preventDefault()
    if (!validatePassword()) return
    try {
      const user = await login(form.email, form.password)
      goHome(user)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
  }

  const handleOtpSubmit = async (ev) => {
    ev.preventDefault()
    if (!validateOtp()) return
    try {
      const user = await loginWithOtp(form.email, otpCode.trim())
      goHome(user)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code')
    }
  }

  const handleSendLoginOtp = async () => {
    if (!form.email) {
      toast.error('Enter your email first')
      return
    }
    setOtpSending(true)
    try {
      await sendOtp(form.email, 'login')
      toast.success('Check your email for a sign-in code.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send code')
    } finally {
      setOtpSending(false)
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
        <span className="text-base">{isDark ? '☀' : '☾'}</span>
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
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-glow mb-4 transition-transform hover:scale-105"
            >
              <Logo className="w-10 h-10" />
            </motion.div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">HealthGuardian</h1>
          <p className="text-slate-400 mt-1 text-sm">Personal Health Management System</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-xl font-bold text-white mb-5">Welcome back</h2>

          <div className="flex rounded-xl bg-surface-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('password'); setErrors({}) }}
              className={clsx(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                mode === 'password' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setErrors({}) }}
              className={clsx(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5',
                mode === 'otp' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <RiShieldKeyholeLine className="text-lg" />
              Email code
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`input pl-10 ${errors.email ? 'border-danger focus:ring-danger/30' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={`input pl-10 pr-10 ${errors.password ? 'border-danger focus:ring-danger/30' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
                {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Sign In'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`input pl-10 ${errors.email ? 'border-danger focus:ring-danger/30' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendLoginOtp}
                  disabled={otpSending || !form.email}
                  className="btn-ghost shrink-0 px-4 py-2.5 border border-surface-border text-sm whitespace-nowrap"
                >
                  {otpSending ? 'Sending…' : 'Send code'}
                </button>
                <div className="flex-1">
                  <label className="label">6-digit code</label>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`input font-mono tracking-widest ${errors.code ? 'border-danger' : ''}`}
                  />
                  {errors.code && <p className="text-danger text-xs mt-1">{errors.code}</p>}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Sign in with code'}
              </motion.button>
            </form>
          )}

          <div className="mt-6 border-t border-surface-border pt-6">
            <p className="mb-3 text-center text-xs text-slate-500">Or continue with</p>
            {googleClientId ? (
              <div className="flex justify-center [&>div]:w-full">
                <GoogleLogin
                  onSuccess={async (cred) => {
                    if (!cred?.credential) {
                      toast.error('Google did not return a valid credential.')
                      return
                    }
                    try {
                      const user = await loginWithGoogle(cred.credential)
                      goHome(user)
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Google sign-in failed')
                    }
                  }}
                  onError={() => toast.error('Google sign-in was cancelled or failed.')}
                  theme="filled_black"
                  size="large"
                  width="384"
                  text="continue_with"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-surface-border bg-surface-muted/60 px-4 py-3 text-center text-xs text-slate-400">
                Google Sign-In is not configured yet. Add <code className="text-primary-400">VITE_GOOGLE_CLIENT_ID</code> in frontend
                <code className="ml-1 text-primary-400">.env</code> and restart the dev server.
              </div>
            )}
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Google creates or opens a patient account. Doctors should register with email and password.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  )
}
