import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiGroupLine, RiShieldUserLine, RiUserAddLine,
  RiSearchLine, RiDeleteBinLine, RiToggleLine,
  RiHeartPulseLine, RiServerLine, RiFilterLine,
  RiTimeLine, RiCheckLine, RiCloseLine, RiRefreshLine,
} from 'react-icons/ri'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { adminService } from '../../services/adminService'
import { unwrapData } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { getInitials, getAvatarColor, statusColor, formatDate, timeAgo } from '../../utils/helpers'
import { BLOOD_GROUPS } from '../../utils/constants'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PIE_COLORS = ['#3897f0', '#00e5c3', '#f5365c', '#fb8c00']

const EMPTY_FORM = { name: '', email: '', password: '', role: 'patient', phone: '' }

export default function AdminPanel() {
  const qc = useQueryClient()
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [addModal, setAddModal] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats().then(unwrapData),
  })

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => adminService.getUsers({ role: roleFilter !== 'all' ? roleFilter : undefined }).then(unwrapData),
  })

  const { data: sysData, refetch: refetchSystemHealth, isFetching: systemHealthFetching } = useQuery({
    queryKey: ['admin-system'],
    queryFn: () => adminService.getSystemHealth().then(unwrapData),
    refetchInterval: 30000,
  })

  const { data: pendingDoctorsData, isLoading: loadingPending } = useQuery({
    queryKey: ['admin-pending-doctors'],
    queryFn: () => adminService.getDoctors({ isApproved: 'false', limit: 50 }).then(unwrapData),
  })

  const createMut = useMutation({
    mutationFn: (payload) => adminService.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries(['admin-users'])
      qc.invalidateQueries(['admin-stats'])
      toast.success('User created!')
      setAddModal(false)
      setForm(EMPTY_FORM)
    },
  })

  const toggleMut = useMutation({
    mutationFn: (id) => adminService.toggleUserStatus(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Status updated') },
  })

  const deleteMut = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-users'])
      qc.invalidateQueries(['admin-stats'])
      toast.success('User deleted')
    },
  })

  const approveDoctorMut = useMutation({
    mutationFn: ({ id, approve }) => adminService.approveDoctor(id, approve),
    onSuccess: (_, { approve }) => {
      qc.invalidateQueries(['admin-pending-doctors'])
      qc.invalidateQueries(['admin-users'])
      qc.invalidateQueries(['admin-stats'])
      toast.success(approve ? 'Doctor approved' : 'Registration rejected')
    },
  })

  const stats = statsData ?? {}
  const users = usersData?.users ?? []
  const pendingDoctors = pendingDoctorsData?.doctors ?? []
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const pieData = [
    { name: 'Patients', value: stats.totalPatients ?? 0 },
    { name: 'Doctors',  value: stats.totalDoctors  ?? 0 },
    { name: 'Admins',   value: stats.totalAdmins   ?? 0 },
  ].filter(d => d.value > 0)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields')
    createMut.mutate(form)
  }

  if (loadingStats) return <FullPageLoader message="Loading admin panel…" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">System administration and user management</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
          <RiUserAddLine className="text-lg" /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users"   value={stats.totalUsers    ?? 0} icon={RiGroupLine}      color="blue"   delay={0}    trend={stats.userTrend} />
        <StatCard title="Total Patients" value={stats.totalPatients ?? 0} icon={RiHeartPulseLine} color="cyan"   delay={0.08} />
        <StatCard title="Total Doctors"  value={stats.totalDoctors  ?? 0} icon={RiShieldUserLine} color="green"  delay={0.16} />
        <StatCard title="Active Today"   value={stats.activeToday   ?? 0} icon={RiServerLine}     color="orange" delay={0.24} trend={stats.activeTrend} />
      </div>

      {/* Pending doctor registrations (show if stats say pending OR list has rows OR still loading) */}
      {(loadingPending || pendingDoctors.length > 0 || (stats.pendingDoctors ?? 0) > 0) && (
        <div className="card border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 mb-4">
            <RiTimeLine className="text-xl text-warning" />
            <h2 className="font-display font-bold text-white">Pending doctor approvals</h2>
            <span className="badge badge-warning ml-auto">{stats.pendingDoctors ?? pendingDoctors.length} waiting</span>
          </div>
          {loadingPending ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-surface-border border-t-warning rounded-full animate-spin" />
            </div>
          ) : pendingDoctors.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No pending doctor registrations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Doctor', 'Email', 'Specialization', 'License', 'Registered', 'Actions'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {pendingDoctors.map((d) => (
                    <tr key={d._id} className="hover:bg-surface-muted/40">
                      <td className="py-3 px-3 font-medium text-white">{d.name}</td>
                      <td className="py-3 px-3 text-slate-400">{d.email}</td>
                      <td className="py-3 px-3 text-slate-400">{d.specialization || '—'}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-xs">{d.licenseNumber || '—'}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(d.createdAt)}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={approveDoctorMut.isPending}
                            onClick={() => approveDoctorMut.mutate({ id: d._id, approve: true })}
                            className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                          >
                            <RiCheckLine /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={approveDoctorMut.isPending}
                            onClick={() => {
                              if (confirm(`Reject registration for ${d.name}?`)) approveDoctorMut.mutate({ id: d._id, approve: false })
                            }}
                            className="btn-danger text-xs py-1.5 px-3 inline-flex items-center gap-1"
                          >
                            <RiCloseLine /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Charts + System Health */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="card">
          <h2 className="font-display font-bold text-white mb-4">User Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#151e2e', border: '1px solid #1e2d42', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No user data</div>
          )}
        </div>

        {/* System Health */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-white">System Health</h2>
              <p className="text-xs text-slate-500 mt-1">
                Last checked {sysData?.checkedAt ? timeAgo(sysData.checkedAt) : 'soon'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchSystemHealth()}
              disabled={systemHealthFetching}
              className="btn-ghost border border-surface-border inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              <RiRefreshLine className={clsx('text-lg', systemHealthFetching && 'animate-spin')} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'API Status',    value: sysData?.apiStatus    ?? 'Checking…', ok: sysData?.apiStatus    === 'online' },
              { label: 'Database',      value: sysData?.dbStatus     ?? 'Checking…', ok: sysData?.dbStatus     === 'connected' },
              { label: 'Uptime',        value: sysData?.uptime        ?? '—',        ok: true },
              { label: 'Memory Usage',  value: sysData?.memoryUsage  ?? '—',        ok: (parseFloat(sysData?.memoryUsage) ?? 0) < 80 },
              { label: 'Disk Space',    value: sysData?.diskSpace     ?? '—',        ok: true },
              { label: 'Last Backup',   value: sysData?.lastBackup   ? timeAgo(sysData.lastBackup) : '—', ok: true },
            ].map(item => (
              <div key={item.label} className="p-3 bg-surface-muted rounded-xl border border-surface-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
                </div>
                <div className={clsx('w-2.5 h-2.5 rounded-full', item.ok ? 'bg-success animate-pulse-slow' : 'bg-danger')} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <h2 className="font-display font-bold text-white">All Users</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input pl-9 py-2 text-sm" />
            </div>
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input pl-9 py-2 text-sm min-w-[120px]">
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-10">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                <AnimatePresence>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', getAvatarColor(u.name))}>
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={clsx('badge', {
                          patient: 'badge-info',
                          doctor: 'badge-success',
                          admin: 'badge-warning',
                        }[u.role] ?? 'badge-info')}>{u.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={clsx('badge', statusColor(u.status ?? 'active'))}>{u.status ?? 'active'}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMut.mutate(u._id)}
                            title="Toggle status"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-warning hover:bg-warning/10 transition-all"
                          >
                            <RiToggleLine className="text-lg" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteMut.mutate(u._id) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                          >
                            <RiDeleteBinLine className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setForm(EMPTY_FORM) }} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="input" required />
            </div>
            <div className="col-span-2">
              <label className="label">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="input" required />
            </div>
            <div>
              <label className="label">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" className="input" required />
            </div>
            <div>
              <label className="label">Role *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="btn-ghost flex-1 border border-surface-border">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {createMut.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
