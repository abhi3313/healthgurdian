import { RiMenu2Line, RiSearchLine, RiCalendarLine, RiFileList3Line, RiUploadCloud2Line } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/helpers'
import { useTheme } from '../../context/ThemeContext'
import { patientService } from '../../services/patientService'
import { unwrapData } from '../../services/api'

export default function TopBar({ onToggleSidebar, role }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [searchVal, setSearchVal] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchWrapRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const hasSearch = role === 'patient'

  useEffect(() => {
    if (!hasSearch) return
    const query = searchVal.trim()
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    let active = true
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const [recordsRes, appointmentsRes, reportsRes] = await Promise.all([
          patientService.getRecords({ search: query, limit: 6 }),
          patientService.getAppointments(),
          patientService.getReports(),
        ])

        const records = unwrapData(recordsRes)?.records ?? []
        const appointments = (unwrapData(appointmentsRes)?.appointments ?? [])
          .filter((apt) => {
            const hay = [
              apt.reason,
              apt.status,
              apt.doctor?.name,
              apt.doctor?.specialization,
            ].join(' ').toLowerCase()
            return hay.includes(query.toLowerCase())
          })
          .slice(0, 6)
        const reports = (unwrapData(reportsRes)?.reports ?? [])
          .filter((rep) => {
            const hay = [rep.filename, rep.name, rep.tag].join(' ').toLowerCase()
            return hay.includes(query.toLowerCase())
          })
          .slice(0, 6)

        const merged = [
          ...records.map((r) => ({
            id: r._id,
            type: 'record',
            icon: RiFileList3Line,
            title: r.type || 'Record',
            subtitle: r.description || 'Health record',
            to: `/patient/records?q=${encodeURIComponent(query)}`,
          })),
          ...appointments.map((a) => ({
            id: a._id,
            type: 'appointment',
            icon: RiCalendarLine,
            title: a.doctor?.name || 'Appointment',
            subtitle: `${a.reason || 'Appointment'} · ${a.status || ''}`.trim(),
            to: `/patient/appointments?q=${encodeURIComponent(query)}`,
          })),
          ...reports.map((r) => ({
            id: r._id,
            type: 'report',
            icon: RiUploadCloud2Line,
            title: r.filename || r.name || 'Report',
            subtitle: r.tag || 'Uploaded report',
            to: `/patient/upload?q=${encodeURIComponent(query)}`,
          })),
        ].slice(0, 10)

        if (active) {
          setSearchResults(merged)
          setSearchOpen(true)
        }
      } catch {
        if (active) setSearchResults([])
      } finally {
        if (active) setSearchLoading(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchVal, hasSearch])

  const groupedResults = useMemo(() => {
    return {
      record: searchResults.filter((x) => x.type === 'record'),
      appointment: searchResults.filter((x) => x.type === 'appointment'),
      report: searchResults.filter((x) => x.type === 'report'),
    }
  }, [searchResults])

  const openResult = (item) => {
    setSearchOpen(false)
    navigate(item.to)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults[0]) {
        openResult(searchResults[0])
      } else if (searchVal.trim().length >= 2) {
        navigate(`/patient/records?q=${encodeURIComponent(searchVal.trim())}`)
        setSearchOpen(false)
      }
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className={`h-16 shrink-0 flex items-center justify-between px-6 border-b border-surface-border backdrop-blur-md z-10 ${
      isDark ? 'bg-surface-card/60' : 'bg-white/90 shadow-sm shadow-slate-200/70'
    }`}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl transition-all ${
            isDark
              ? 'text-slate-300 hover:text-white hover:bg-surface-muted'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 bg-white/90'
          }`}
        >
          <RiMenu2Line className="text-xl" />
        </button>

        <div>
          <p className="text-sm font-semibold text-white leading-none">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'User'} 
          </p>
          <p className={isDark ? 'text-xs text-slate-500 mt-0.5' : 'text-xs text-slate-700 mt-0.5 font-medium'}>
            {formatDate(new Date(), 'EEEE, MMMM, dd yyyy')}
          </p>
        </div>
      </div>

      {/* Center – global search */}
      {hasSearch && (
        <div ref={searchWrapRef} className="hidden md:block relative w-[30rem] max-w-[42vw]">
          <div className="flex items-center gap-2 bg-surface-muted border border-surface-border rounded-xl px-3 py-2">
            <RiSearchLine className={isDark ? 'text-slate-500 text-lg shrink-0' : 'text-slate-600 text-lg shrink-0'} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchOpen(searchVal.trim().length >= 2)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search records, appointments, reports..."
              className={isDark
                ? 'bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full'
                : 'bg-transparent text-sm text-slate-800 placeholder-slate-500 outline-none w-full'}
            />
          </div>
          {searchOpen && (
            <div className="absolute top-12 left-0 right-0 z-30 rounded-xl border border-surface-border bg-surface-card shadow-card p-2 max-h-80 overflow-y-auto">
              {searchLoading ? (
                <p className="text-xs text-slate-500 px-2 py-2">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-2">No results found</p>
              ) : (
                <>
                  {['record', 'appointment', 'report'].map((typeKey) => (
                    groupedResults[typeKey].length > 0 && (
                      <div key={typeKey} className="mb-1 last:mb-0">
                        <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                          {typeKey === 'record' ? 'Records' : typeKey === 'appointment' ? 'Appointments' : 'Reports'}
                        </p>
                        {groupedResults[typeKey].map((item) => (
                          <button
                            type="button"
                            key={`${item.type}-${item.id}`}
                            onClick={() => openResult(item)}
                            className="w-full text-left px-2 py-2 rounded-lg hover:bg-surface-muted transition-colors flex items-start gap-2"
                          >
                            <item.icon className="text-slate-400 mt-0.5 shrink-0" />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-white truncate">{item.title}</span>
                              <span className="block text-[11px] text-slate-500 truncate">{item.subtitle}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          aria-label="Toggle theme"
          className={`p-2 rounded-xl transition-all ${
            isDark
              ? 'text-slate-300 hover:text-white hover:bg-surface-muted'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 bg-white/90'
          }`}
          onClick={toggleTheme}
          type="button"
        >
          <span className="text-base">{isDark ? '☀' : '☾'}</span>
        </button>
      </div>
    </header>
  )
}
