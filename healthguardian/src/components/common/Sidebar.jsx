import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiDashboardLine, RiFileList3Line, RiUploadCloud2Line,
  RiRobotLine, RiGroupLine, RiShieldUserLine,
  RiLogoutBoxRLine, RiSettings3Line,
  RiShieldCheckLine, RiIdCardLine, RiSendPlaneFill, RiInboxLine,
  RiCalendarLine, RiHeartPulseLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { getInitials, getAvatarColor } from '../../utils/helpers'
import clsx from 'clsx'
import Logo from './Logo'

const NAV = {
  patient: [
    { to: '/patient',             label: 'Dashboard',      icon: RiDashboardLine,   group: 'main' },
    { to: '/patient/records',     label: 'My Records',     icon: RiFileList3Line,   group: 'main' },
    { to: '/patient/upload',      label: 'Upload Report',  icon: RiUploadCloud2Line,group: 'main' },
    { to: '/patient/appointments',label: 'Appointments',   icon: RiCalendarLine,    group: 'main' },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: RiHeartPulseLine, group: 'main' },
    { to: '/patient/ai-chat',     label: 'AI Assistant',   icon: RiRobotLine,       group: 'main' },
    { to: '/patient/my-id',       label: 'My Patient ID',  icon: RiIdCardLine,      group: 'access' },
    { to: '/patient/access',      label: 'Doctor Access',  icon: RiShieldCheckLine, group: 'access' },
  ],
  doctor: [
    { to: '/doctor',              label: 'Dashboard',      icon: RiDashboardLine,   group: 'main' },
    { to: '/doctor/patients',     label: 'My Patients',    icon: RiGroupLine,       group: 'main' },
    { to: '/doctor/appointments', label: 'Appointments',   icon: RiCalendarLine,    group: 'main' },
    { to: '/doctor/request-access', label: 'Request Access', icon: RiSendPlaneFill, group: 'access' },
    { to: '/doctor/my-requests',  label: 'My Requests',    icon: RiInboxLine,       group: 'access' },
  ],
  admin: [
    { to: '/admin',               label: 'Admin Panel',    icon: RiShieldUserLine,  group: 'main' },
  ],
}

const ROLE_LABEL = { patient: 'Patient', doctor: 'Doctor', admin: 'Administrator' }
const ROLE_COLOR = { patient: 'text-accent', doctor: 'text-primary-400', admin: 'text-warning' }

const listVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.055 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const allLinks         = NAV[role] ?? []
  const mainLinks        = allLinks.filter(l => l.group === 'main')
  const accessLinks      = allLinks.filter(l => l.group === 'access')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-surface-card border-r border-surface-border">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-10 h-10 rounded-2xl bg-slate-900/10 flex items-center justify-center shadow-glow">
          <Logo className="w-7 h-7" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-base leading-none">HealthGuardian</p>
          <p className={clsx('text-xs font-semibold mt-0.5', ROLE_COLOR[role])}>
            {ROLE_LABEL[role]}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-5">
        <div>
          <p className="label px-2 mb-2">Navigation</p>
          <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
            {mainLinks.map(({ to, label, icon: Icon }) => (
              <motion.li key={to} variants={itemVariants}>
                <NavLink to={to} end={to === `/${role}`}
                  className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
                  <Icon className="text-lg shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {accessLinks.length > 0 && (
          <div>
            <p className="label px-2 mb-2">Access Control</p>
            <motion.ul variants={listVariants} initial="hidden" animate="show" className="space-y-1">
              {accessLinks.map(({ to, label, icon: Icon }) => (
                <motion.li key={to} variants={itemVariants}>
                  <NavLink to={to}
                    className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
                    <Icon className="text-lg shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}

        {(role === 'patient' || role === 'doctor') && (
          <div className="pt-2 border-t border-surface-border">
            <p className="label px-2 mb-2">Account</p>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to={`/${role}/settings`}
                  className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                >
                  <RiSettings3Line className="text-lg shrink-0" />
                  <span>Settings</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-surface-border">
          <div className={clsx(
            'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0',
            getAvatarColor(user?.name ?? ''),
          )}>
            {getInitials(user?.name ?? 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email ?? ''}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-slate-500 hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10">
            <RiLogoutBoxRLine className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  )
}
