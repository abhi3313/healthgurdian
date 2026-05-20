import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const sectionClass = 'py-16 px-4 sm:px-6 md:px-8 md:py-24'
const navItems = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'doctors', label: 'Doctors', href: '#doctors' },
  { id: 'ai-mentor', label: 'AI Mentor', href: '#ai-mentor' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 140
      const ids = navItems.map((item) => item.id).filter((id) => id !== 'home')

      if (window.scrollY < 120) {
        setActiveSection('home')
        return
      }

      let current = 'home'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (scrollY >= el.offsetTop) current = id
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] dark:bg-slate-950 dark:text-slate-100">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 md:gap-10 md:px-8 md:py-4">
          <div className="text-xl font-extrabold tracking-tight text-blue-700">HealthGuardian</div>
          <div className="hidden flex-1 items-center gap-8 text-sm font-medium tracking-tight md:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <a
                  className={`border-b-2 pb-1 transition-colors duration-200 hover:text-blue-600 ${
                    isActive
                      ? 'border-blue-700 font-bold text-blue-700'
                      : 'border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                </a>
              )
            })}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link className="hidden px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 sm:block" to="/login">
              Login
            </Link>
            <Link className="rounded-full bg-gradient-to-r from-[#0040a1] to-[#0056d2] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95 sm:px-5 sm:py-2 sm:text-sm" to="/register">
              Register
            </Link>
            <button
              aria-label="Toggle theme"
              className={`flex items-center justify-center rounded-full p-2.5 transition-colors duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
              onClick={toggleTheme}
              type="button"
            >
              <span className="text-[20px]">{isDark ? '☀' : '☾'}</span>
            </button>
            <button
              aria-label="Toggle menu"
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              type="button"
            >
              <span className="text-lg">{isMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <a
                  className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  href={item.href}
                  key={item.id}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
                to="/login"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16 md:pt-20">
        <section className="flex min-h-[auto] items-center bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] px-4 py-12 sm:px-6 md:min-h-[820px] md:px-8 md:py-0 dark:from-slate-900 dark:to-slate-800">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 py-8 md:grid-cols-2 md:gap-12 md:py-20">
            <div className="space-y-8">
              <span className="inline-block rounded-full bg-[#dae2ff] px-3 py-1 text-xs font-semibold text-[#0040a1] sm:px-4 sm:py-1.5 sm:text-sm">
                AI-Powered Health Sanctuary
              </span>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
                Your Personal <br />
                <span className="text-[#0040a1]">Health Management</span> System
              </h1>
              <p className="max-w-lg text-base text-slate-600 sm:text-lg dark:text-slate-300">
                Store, manage, and understand your medical records with AI-powered guidance. Experience a digital sanctuary designed for your clinical well-being.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 sm:gap-4 sm:pt-4">
                <Link className="rounded-xl bg-[#0040a1] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 sm:px-8 sm:py-4" to="/register">
                  Get Started
                </Link>
                <a className="rounded-xl border border-[#006b5f] px-5 py-3 text-sm font-semibold text-[#006b5f] transition-all hover:bg-[#6df5e1]/20 sm:px-8 sm:py-4 dark:text-emerald-300" href="#features">
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[120px]" />
              <img
                alt="Healthcare Management Platform"
                className="relative z-10 w-full rounded-3xl border border-white/50 shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9prmblcsH0WO9tvDHBrlB_RKG-bVnfvmVRAU43PddPhtoKQ9dnMg1EvOWM590ne1zx3YL3391I3d4DNhr9T0D8yqaxnuKcVwPYetYwvvjHUWzDdMBdzZhizsGSpyeocJmjnt1SKh3fa97OS9PsTLvYkkll-4DePUSxcwj-P1vgmQ-5Lks4IMg_1Y7QlCeS_RvCe6uPZvpKjwLbhn5A0iKsViJyyvqnYAg99gh4O_NoStHwkt_v-It0IJkE6SOOZm_cQNLHbyvWKI"
              />
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-white dark:bg-slate-950`} id="features">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 space-y-4 text-center md:mb-16">
              <h2 className="text-3xl font-bold md:text-4xl">Integrated Health Ecosystem</h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">Innovative tools designed to make health management effortless, safe, and intuitive.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group rounded-[2rem] border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 sm:p-8 md:col-span-2 md:p-10 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dae2ff] text-3xl text-[#0040a1]">📝</div>
                <h3 className="mb-4 text-2xl font-semibold">Digital Health Records</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">Centralize all your imaging, lab results, and history in a secure, encrypted vault accessible anywhere in the world.</p>
                <img
                  alt="Health Dashboard"
                  className="h-48 w-full rounded-2xl object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvmYzvQhzul05GZHg843UiXTiUJTIEQ5TIt-xIDFl2Fdu1pDny38mvrYd9ulspPm9-GCfONbbJdPY36CpHOLoUCmMEHtbvUEu2umeacQeH4VyKyW78CUbWmbwhpclKMMDphK2FVv1-IoSmAKd02GU2dSLhYEEgZH_FUkucWALFfadXQdzP20_jiyeCpCiG_cvMHc-DPD7JZacEuyxOF6FDa4ta-cDBRWeDkISHf1Rvc_LGG5rwCOvIdJRMbCSpwCkh4lyNgZzN6u4"
                />
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-[#eff4ff] p-6 shadow-sm transition-all hover:shadow-xl sm:p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900" id="ai-mentor">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaddff] text-3xl text-[#5a00c7]">🧠</div>
                <h3 className="mb-4 text-2xl font-semibold">AI Mentor</h3>
                <p className="text-slate-600 dark:text-slate-300">Instant explanations for complex prescriptions. Understand side effects and dosage timing with empathetic AI support.</p>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-[#eff4ff] p-6 shadow-sm transition-all hover:shadow-xl sm:p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900" id="doctors">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6df5e1] text-3xl text-[#006f64]">📅</div>
                <h3 className="mb-4 text-2xl font-semibold">Smart Booking</h3>
                <p className="text-slate-600 dark:text-slate-300">Direct access to leading specialists. AI recommends the best doctor based on your historical records.</p>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-[#eff4ff] p-6 shadow-sm transition-all hover:shadow-xl sm:p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900" id="pharmacy">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dae2ff] text-3xl text-[#0040a1]">💊</div>
                <h3 className="mb-4 text-2xl font-semibold">E-Pharmacy</h3>
                <p className="text-slate-600 dark:text-slate-300">Order medications with a single tap. Automated refills ensure you never miss a critical dose.</p>
              </div>

              <div className="rounded-[2rem] border border-red-200 bg-[#ffdad6] p-6 shadow-sm transition-all hover:shadow-xl sm:p-8 md:p-10 dark:border-red-900 dark:bg-red-950/40">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl text-red-600">⚠</div>
                <h3 className="mb-4 text-2xl font-semibold text-red-900 dark:text-red-200">Safety Alerts</h3>
                <p className="text-red-900/80 dark:text-red-200/80">Real-time monitoring for allergy and drug-to-drug conflicts. Vigilance that saves lives.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${sectionClass} relative overflow-hidden bg-[#f8f9ff] dark:bg-slate-900`}>
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">
            <div className="relative z-10">
              <h2 className="mb-8 text-3xl font-bold leading-tight md:text-4xl">
                From Paper Chaos to <br />
                <span className="text-[#0040a1]">Clinical Harmony</span>
              </h2>
              <div className="space-y-6 text-base text-slate-600 md:text-lg dark:text-slate-300">
                <p>For decades, medical history was a fragmented puzzle of paper records, scattered emails, and forgotten diagnoses. We built HealthGuardian to be the missing link.</p>
                <p>Our platform centralizes your entire health journey into a unified, intelligent dashboard. No more carrying folders to appointments or struggling to remember past treatments.</p>
                <div className="grid grid-cols-2 gap-4 pt-4 sm:gap-6 sm:pt-6">
                  <div>
                    <div className="mb-1 text-3xl font-bold text-[#0040a1]">99.9%</div>
                    <div className="text-sm font-semibold uppercase tracking-wide opacity-60">Data Security</div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl font-bold text-[#0040a1]">24/7</div>
                    <div className="text-sm font-semibold uppercase tracking-wide opacity-60">AI Assistance</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                alt="Digital Transformation"
                className="rotate-1 rounded-[2rem] shadow-2xl transition-transform duration-700 hover:rotate-0 md:rotate-3 md:rounded-[3rem]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpFLXbtUTSS01Eg4agTaQ76VkoVnynu2iyrbfrhrVZfg6MnVeaONG--XVRj3_RZz4Urzo_C-PiQX6AIWJajiBg1jdwd58J7Fau53XoPt0ATsZz4PAgCGFqHxb4_GoWGL-mCXlyJydgod29xTq-32K-OzwQwdSk8TqRZ7aAZDKgyP97JzkqqYl5ZZ0ZTbNaRIrdCS2SsO7ffYDyRG9ae9MF8qOmYtv1B-BYMl-9IlumsXfZVweWNtO0LstJAPN0yrVXVn0O2vPtvz0"
              />
            </div>
          </div>
        </section>

        <section className={`${sectionClass} bg-white dark:bg-slate-950`}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center md:mb-20">
              <h2 className="text-3xl font-bold md:text-4xl">Getting Started is Simple</h2>
            </div>
            <div className="relative flex flex-col justify-between gap-10 md:flex-row md:gap-8">
              <div className="absolute left-0 top-1/2 -z-10 hidden h-0.5 w-full bg-slate-100 md:block dark:bg-slate-800" />
              {[
                ['1', 'Join HealthGuardian', 'Register your account and set up your secure biometric profile.'],
                ['2', 'Upload Records', 'Scan or upload your historical records. Our AI automatically tags and sorts them.'],
                ['3', 'Connect & Buy', 'Book specialists directly or fulfill prescriptions through our integrated pharmacy.'],
                ['4', 'AI Guidance', 'Receive real-time insights and 24/7 mentorship regarding your health status.'],
              ].map(([step, title, description]) => (
                <div className="group flex-1 text-center md:px-2" key={step}>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#dae2ff] bg-white text-xl font-bold text-[#0040a1] shadow-lg transition-all group-hover:bg-[#0040a1] group-hover:text-white dark:border-slate-700 dark:bg-slate-900">
                    {step}
                  </div>
                  <h4 className="mb-3 text-sm font-semibold">{title}</h4>
                  <p className="px-4 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" id="contact">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-10 px-4 py-10 sm:px-6 md:flex-row md:items-center md:gap-12 md:px-8 md:py-12">
          <div className="space-y-4">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">HealthGuardian</div>
            <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Elevating personal healthcare through clinical excellence and empathetic artificial intelligence.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100">Platform</span>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#features">Features</a>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#ai-mentor">AI Mentor</a>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#pharmacy">Pharmacy</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100">Company</span>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#">Privacy Policy</a>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#">Terms of Service</a>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#">Help Center</a>
              <a className="text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100" href="#">Career</a>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex gap-4 text-slate-400">
              <span className="cursor-pointer transition-colors hover:text-[#0040a1]">↗</span>
              <span className="cursor-pointer transition-colors hover:text-[#0040a1]">🌐</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">© 2026 HealthGuardian. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
