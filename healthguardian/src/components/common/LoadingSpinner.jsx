import { motion } from 'framer-motion'
import clsx from 'clsx'

export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx(
      'border-2 border-surface-border border-t-primary-500 rounded-full animate-spin',
      sizes[size], className
    )} />
  )
}

export function FullPageLoader({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-surface-border border-t-primary-500"
      />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card space-y-3 animate-pulse">
      <div className="skeleton h-4 w-1/3 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3 rounded-lg" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-10 rounded-lg flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
