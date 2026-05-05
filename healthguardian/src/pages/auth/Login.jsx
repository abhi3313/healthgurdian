import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import clsx from 'clsx'
import { RiHeartPulseFill, RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { sendOtp } from '../../services/authService'
import toast from 'react-hot-toast'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const { login, loginWithOtp, loginWithGoogle, loading } = useAuth()
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-glow mb-4"
          >
            <RiHeartPulseFill className="text-white text-3xl" />
          </motion.div>
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

          {googleClientId && (
            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-center text-xs text-slate-500 mb-3">Or continue with</p>
              <div className="flex justify-center [&>div]:w-full">
                <GoogleLogin
                  onSuccess={async (cred) => {
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
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Google creates or opens a patient account. Doctors should register with email and password.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {mode === 'password' && (
          <div className="mt-4 card p-4">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Patient', email: 'patient@demo.com', pass: 'demo123' },
                { role: 'Doctor',  email: 'doctor@demo.com',  pass: 'demo123' },
                { role: 'Admin',   email: 'admin@demo.com',   pass: 'demo123' },
              ].map(d => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => setForm({ email: d.email, password: d.pass })}
                  className="text-center p-2 rounded-lg bg-surface-muted border border-surface-border hover:border-primary-600/50 transition-all group"
                >
                  <p className="text-xs font-bold text-primary-400 group-hover:text-primary-300">{d.role}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">{d.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
