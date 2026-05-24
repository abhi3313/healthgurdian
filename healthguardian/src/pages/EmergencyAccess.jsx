import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { unwrapData } from '../services/api'
import { emergencyService } from '../services/emergencyService'

function InfoList({ title, items, empty = 'Not recorded' }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</div>
      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((item) => (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>
      )}
    </div>
  )
}

export default function EmergencyAccess() {
  const { isDark, toggleTheme } = useTheme()
  const [patientId, setPatientId] = useState('')
  const [emergencyProfile, setEmergencyProfile] = useState(null)
  const [emergencyLoading, setEmergencyLoading] = useState(false)
  const [emergencyError, setEmergencyError] = useState('')

  const handleEmergencyLookup = async (event) => {
    event.preventDefault()

    const normalized = patientId.trim().toUpperCase()
    setEmergencyError('')
    setEmergencyProfile(null)

    if (!/^HG-P-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
      setEmergencyError('Enter a valid Patient ID in the format HG-P-XXXX-XXXX.')
      return
    }

    setEmergencyLoading(true)
    try {
      const res = await emergencyService.getEmergencyProfile(normalized)
      const payload = unwrapData(res) ?? {}
      setEmergencyProfile(payload.emergencyProfile || null)
      if (!payload.emergencyProfile) {
        setEmergencyError('No emergency profile found for this Patient ID.')
      }
    } catch (error) {
      setEmergencyError(error.response?.data?.message || 'Unable to fetch emergency details. Please check the Patient ID and try again.')
    } finally {
      setEmergencyLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] dark:bg-slate-950 dark:text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/85 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link className="shrink-0 text-xl font-extrabold tracking-tight text-blue-700" to="/">
            HealthGuardian
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="hidden px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 sm:block" to="/">
              Home
            </Link>
            <Link className="hidden px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 sm:block" to="/login">
              Login
            </Link>
            <Link className="rounded-full bg-gradient-to-r from-[#0040a1] to-[#0056d2] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95 sm:px-5 sm:py-2 sm:text-sm" to="/register">
              Register
            </Link>
            <button
              aria-label="Toggle theme"
              className={`flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
              onClick={toggleTheme}
              type="button"
            >
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <div className="mb-5 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 dark:bg-red-900/60 dark:text-red-200">
              Emergency Access
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
              Find critical patient details fast
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Enter a HealthGuardian Patient ID to view emergency-safe details such as blood group, allergies, current medicines, critical conditions, and emergency contact.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-xl shadow-red-900/5 sm:p-8 dark:border-red-900/70 dark:bg-red-950/30">
              <form className="space-y-4" onSubmit={handleEmergencyLookup}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-red-900/70 dark:text-red-100/70" htmlFor="emergency-patient-id">
                    Patient ID
                  </label>
                  <input
                    className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-slate-900 outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-900 dark:bg-slate-950 dark:text-white"
                    disabled={emergencyLoading}
                    id="emergency-patient-id"
                    onChange={(event) => setPatientId(event.target.value)}
                    placeholder="HG-P-XXXX-XXXX"
                    value={patientId}
                  />
                </div>
                <button
                  className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                  disabled={emergencyLoading}
                  type="submit"
                >
                  {emergencyLoading ? 'Fetching emergency details...' : 'Get Emergency Details'}
                </button>
              </form>

              {emergencyError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                  {emergencyError}
                </div>
              )}

              <p className="mt-5 text-xs leading-relaxed text-red-900/60 dark:text-red-100/60">
                Only emergency-safe fields are shown. Private records, reports, prescriptions, AI chats, and full history remain protected.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
              {emergencyProfile ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergency Information</div>
                      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{emergencyProfile.fullName}</h2>
                      <p className="mt-1 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{emergencyProfile.patientId}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:min-w-52">
                      <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950">
                        <div className="text-xs font-semibold text-slate-500">Age</div>
                        <div className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{emergencyProfile.age ?? 'N/A'}</div>
                      </div>
                      <div className="rounded-2xl bg-red-600 p-3 text-center text-white">
                        <div className="text-xs font-semibold text-red-100">Blood</div>
                        <div className="mt-1 text-xl font-bold">{emergencyProfile.bloodGroup || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {!!emergencyProfile.badges?.length && (
                    <div className="flex flex-wrap gap-2">
                      {emergencyProfile.badges.map((badge) => (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/60 dark:text-red-100" key={badge}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoList title="Known Allergies" items={emergencyProfile.allergies} empty="No allergies recorded" />
                    <InfoList title="Current Medicines" items={emergencyProfile.currentMedicines} empty="No active medicines recorded" />
                    <InfoList title="Chronic Conditions" items={emergencyProfile.chronicConditions} empty="No chronic conditions recorded" />
                    <InfoList title="Critical Conditions" items={emergencyProfile.importantMedicalConditions} empty="No critical conditions recorded" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergency Contact</div>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{emergencyProfile.emergencyContactName || 'Not recorded'}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{emergencyProfile.emergencyContactNumber || 'No phone recorded'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergency Notes</div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{emergencyProfile.emergencyNotes || 'No emergency notes recorded'}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated {emergencyProfile.lastUpdated ? new Date(emergencyProfile.lastUpdated).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl font-bold text-red-600 dark:bg-red-900/50">!</div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Emergency profile preview</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Search a valid Patient ID to reveal only the critical information needed in an urgent situation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
