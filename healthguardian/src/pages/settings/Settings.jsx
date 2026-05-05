import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RiSettings3Line, RiUserLine, RiPhoneLine, RiMailLine,
  RiLockPasswordLine, RiEyeLine, RiEyeOffLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { unwrapData } from '../../services/api'
import { BLOOD_GROUPS } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, setSessionUser, setSessionFromAuth } = useAuth()
  const role = user?.role

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    specialization: '',
    hospital: '',
    licenseNumber: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ cur: false, n: false, c: false })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfile(p => ({
      ...p,
      name: user.name ?? '',
      phone: user.phone ?? '',
      bloodGroup: user.bloodGroup ?? '',
      gender: user.gender ?? '',
      dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
      address: user.address ?? '',
      specialization: user.specialization ?? '',
      hospital: user.hospital ?? '',
      licenseNumber: user.licenseNumber ?? '',
    }))
  }, [user])

  const set = (k, v) => setProfile(prev => ({ ...prev, [k]: v }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.name?.trim()) return toast.error('Name is required')
    setSavingProfile(true)
    try {
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone ?? '',
      }
      if (role === 'patient') {
        payload.bloodGroup = profile.bloodGroup || ''
        payload.gender = profile.gender || ''
        if (profile.dateOfBirth) payload.dateOfBirth = profile.dateOfBirth
        payload.address = profile.address ?? ''
      }
      if (role === 'doctor') {
        payload.specialization = profile.specialization ?? ''
        payload.hospital = profile.hospital ?? ''
        payload.licenseNumber = profile.licenseNumber ?? ''
      }
      const res = await authService.updateProfile(payload)
      const inner = unwrapData(res)
      const u = inner?.user
      if (u) setSessionUser(u)
      toast.success(res.data?.message || 'Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pw.current || !pw.next) return toast.error('Fill all password fields')
    if (pw.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pw.next !== pw.confirm) return toast.error('New passwords do not match')
    setSavingPw(true)
    try {
      const { data } = await authService.changePassword({
        currentPassword: pw.current,
        newPassword: pw.next,
      })
      const inner = data.data
      if (inner?.token && inner?.user) {
        setSessionFromAuth(inner.token, inner.user)
      }
      setPw({ current: '', next: '', confirm: '' })
      toast.success(data.message || 'Password updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <RiSettings3Line className="text-primary-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Update your profile and account security</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSaveProfile}
        className="card space-y-5"
      >
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <RiUserLine className="text-accent" /> Profile
        </h2>

        <div>
          <label className="label">Email</label>
          <div className="flex items-center gap-2 input opacity-80 cursor-not-allowed">
            <RiMailLine className="text-slate-500" />
            <span className="text-sm text-slate-400">{user?.email ?? '—'}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Email cannot be changed here</p>
        </div>

        <div>
          <label className="label">Full name *</label>
          <input
            className="input"
            value={profile.name}
            onChange={e => set('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Phone</label>
          <div className="relative">
            <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-10"
              value={profile.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </div>
        </div>

        {role === 'patient' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Blood group</label>
                <select className="input" value={profile.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">—</option>
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={profile.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Date of birth</label>
              <input
                type="date"
                className="input"
                value={profile.dateOfBirth}
                onChange={e => set('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea
                className="input resize-none min-h-[80px]"
                value={profile.address}
                onChange={e => set('address', e.target.value)}
              />
            </div>
          </>
        )}

        {role === 'doctor' && (
          <>
            <div>
              <label className="label">Specialization</label>
              <input className="input" value={profile.specialization} onChange={e => set('specialization', e.target.value)} />
            </div>
            <div>
              <label className="label">Hospital / clinic</label>
              <input className="input" value={profile.hospital} onChange={e => set('hospital', e.target.value)} />
            </div>
            <div>
              <label className="label">License number</label>
              <input className="input" value={profile.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
            </div>
          </>
        )}

        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </motion.form>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleChangePassword}
        className="card space-y-5"
      >
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <RiLockPasswordLine className="text-warning" /> Change password
        </h2>

        <div>
          <label className="label">Current password</label>
          <div className="relative">
            <input
              type={show.cur ? 'text' : 'password'}
              className="input pr-10"
              value={pw.current}
              onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, cur: !s.cur }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1">
              {show.cur ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              type={show.n ? 'text' : 'password'}
              className="input pr-10"
              value={pw.next}
              onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, n: !s.n }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1">
              {show.n ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <div className="relative">
            <input
              type={show.c ? 'text' : 'password'}
              className="input pr-10"
              value={pw.confirm}
              onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1">
              {show.c ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={savingPw} className="btn-primary border border-surface-border bg-surface-muted hover:bg-surface-border text-white">
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </motion.form>
    </div>
  )
}
