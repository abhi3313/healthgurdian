import { RiMenu2Line, RiNotification3Line, RiSearchLine } from 'react-icons/ri'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { formatDate } from '../../utils/helpers'

export default function TopBar({ onToggleSidebar, role }) {
  const { user } = useAuth()
  const [searchVal, setSearchVal] = useState('')

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-surface-border bg-surface-card/60 backdrop-blur-md z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-muted transition-all"
        >
          <RiMenu2Line className="text-xl" />
        </button>

        <div>
          <p className="text-sm font-semibold text-white leading-none">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'User'} 👋
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(new Date(), 'EEEE, MMMM dd yyyy')}</p>
        </div>
      </div>

      {/* Center – search */}
      <div className="hidden md:flex items-center gap-2 bg-surface-muted border border-surface-border rounded-xl px-3 py-2 w-64">
        <RiSearchLine className="text-slate-500 text-lg shrink-0" />
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder="Search…"
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-muted transition-all"
        >
          <RiNotification3Line className="text-xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full ring-2 ring-surface-card" />
        </motion.button>
      </div>
    </header>
  )
}
