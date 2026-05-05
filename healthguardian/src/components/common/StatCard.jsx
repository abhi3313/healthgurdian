import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

export default function StatCard({ title, value, sub, icon: Icon, trend, color = 'blue', delay = 0, to }) {
  const colors = {
    blue:   { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
    cyan:   { bg: 'bg-accent/10',      text: 'text-accent',      border: 'border-accent/20' },
    green:  { bg: 'bg-success/10',     text: 'text-success',     border: 'border-success/20' },
    red:    { bg: 'bg-danger/10',      text: 'text-danger',      border: 'border-danger/20' },
    orange: { bg: 'bg-warning/10',     text: 'text-warning',     border: 'border-warning/20' },
  }
  const c = colors[color] ?? colors.blue

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx('card-hover group h-full', to && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
          {Icon && <Icon className={clsx('text-xl', c.text)} />}
        </div>
        {trend !== undefined && (
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
            trend >= 0
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">{title}</p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
        {to && <p className="text-xs text-primary-400 mt-2 font-medium opacity-80 group-hover:opacity-100">View →</p>}
      </div>
    </motion.div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full min-h-[1px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-label={`${title}: ${value}. Open details.`}
      >
        {card}
      </Link>
    )
  }

  return card
}
