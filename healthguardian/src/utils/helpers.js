import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

const safeDate = (date) => {
  if (!date) return null
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return isValid(d) ? d : null
}

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  const d = safeDate(date)
  if (!d) return '—'
  try { return format(d, fmt) } catch { return '—' }
}

export const timeAgo = (date) => {
  const d = safeDate(date)
  if (!d) return '—'
  try { return formatDistanceToNow(d, { addSuffix: true }) } catch { return '—' }
}

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy • HH:mm')

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'

export const getAvatarColor = (name = '') => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ]
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

export const fileSizeLabel = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const statusColor = (status) => ({
  active:    'badge-success',
  inactive:  'badge-warning',
  suspended: 'badge-danger',
  confirmed: 'badge-success',
  pending:   'badge-warning',
  cancelled: 'badge-danger',
  completed: 'badge-info',
  normal:    'badge-success',
  high:      'badge-danger',
  low:       'badge-warning',
  approved:  'badge-success',
  rejected:  'badge-danger',
  revoked:   'badge-danger',
  'no-show': 'badge-warning',
}[status] ?? 'badge-info')

export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : (str || '')
