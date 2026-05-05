import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiHeartPulseFill, RiUserLine, RiMailLine,
  RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiPhoneLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { sendOtp } from '../../services/authService'
import { ROLES, BLOOD_GROUPS } from '../../utils/constants'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
  { value: 'patient', label: '🧑‍⚕️ Patient',     desc: 'Manage my health records' },
  { value: 'doctor',  label: '👨‍⚕️ Doctor',     desc: 'Manage patients & records' },
]

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', phone: '', bloodGroup: '', dateOfBirth: '',
    specialization: '', hospital: '', licenseNumber: '',
    otpCode: '',
  })
  const [otpSending, setOtpSending] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateStep1 = () => {
    const e = {}
    if (!form.name)    e.name    = 'Full name is required'
    if (!form.email)   e.email   = 'Email is required'
    if (!form.role)    e.role    = 'Please select a role'
    setErrors(e)
    return !Object.keys(e).length
  }

  const validateStep2 = () => {
    const e = {}
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword)      e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validateStep2()) return
    try {
      const { confirmPassword, ...payload } = form
      const user = await register({
        ...payload,
        otpCode: payload.otpCode?.trim() || undefined,
      })
      const routes = { patient: '/patient', doctor: '/doctor', admin: '/admin' }
      navigate(routes[user.role] ?? '/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent shadow-glow mb-4">
            <RiHeartPulseFill className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join HealthGuardian today</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary-500' : 'bg-surface-border'}`} />
          ))}
        </div>

        <div className="card p-8">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-display text-lg font-bold text-white mb-6">Personal Info</h2>
              <div className="space-y-4">
                {/* Role selection */}
                <div>
                  <label className="label">I am a</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => set('role', r.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.role === r.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-surface-border bg-surface-muted hover:border-primary-600/40'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{r.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="John Doe" className={`input pl-10 ${errors.name ? 'border-danger' : ''}`} />
                  </div>
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-danger' : ''}`} />
                  </div>
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="label">Phone (optional)</label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+1 234 567 890" className="input pl-10" />
                  </div>
                </div>

                {form.role === 'patient' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Blood Group</label>
                      <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className="input">
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Date of Birth</label>
                      <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className="input" />
                    </div>
                  </div>
                )}

                {form.role === 'doctor' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">Specialization</label>
                      <input value={form.specialization} onChange={e => set('specialization', e.target.value)}
                        placeholder="e.g. Cardiologist" className="input" />
                    </div>
                    <div>
                      <label className="label">Hospital / clinic</label>
                      <input value={form.hospital} onChange={e => set('hospital', e.target.value)}
                        placeholder="e.g. City Medical Center" className="input" />
                    </div>
                    <div>
                      <label className="label">Medical license number</label>
                      <input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)}
                        placeholder="e.g. MD-2024-001" className="input" />
                    </div>
                  </div>
                )}

                <button type="button" onClick={handleNext} className="btn-primary w-full py-3 mt-2">
                  Next Step →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-display text-lg font-bold text-white mb-6">Set Password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className={`input pl-10 pr-10 ${errors.password ? 'border-danger' : ''}`} />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPass ? 'text' : 'password'} value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                      placeholder="Repeat password"
                      className={`input pl-10 ${errors.confirmPassword ? 'border-danger' : ''}`} />
                  </div>
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-muted/50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email verification</p>
                  <p className="text-xs text-slate-500">
                    Send a one-time code to your email. If your server requires it (<code className="text-primary-400">REQUIRE_REGISTER_OTP=true</code>), you must enter the code below.
                  </p>
                  <div className="flex flex-wrap gap-2 items-end">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!form.email) {
                          toast.error('Complete step 1 with your email first, or go back.')
                          return
                        }
                        setOtpSending(true)
                        try {
                          await sendOtp(form.email, 'register')
                          toast.success('Verification code sent.')
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Could not send code')
                        } finally {
                          setOtpSending(false)
                        }
                      }}
                      disabled={otpSending}
                      className="btn-ghost px-4 py-2.5 border border-surface-border text-sm shrink-0"
                    >
                      {otpSending ? 'Sending…' : 'Send code'}
                    </button>
                    <div className="flex-1 min-w-[140px]">
                      <label className="label text-xs">6-digit code (optional)</label>
                      <input
                        inputMode="numeric"
                        value={form.otpCode}
                        onChange={e => set('otpCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="input font-mono tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 border border-surface-border">
                    ← Back
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
