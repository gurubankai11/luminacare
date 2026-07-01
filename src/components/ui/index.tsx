import { type HTMLAttributes } from 'react'
import { cn, getInitials } from '../../lib/utils'

/* ─── Badge ─── */
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'ghost'
  size?: 'sm' | 'md'
  dot?: boolean
}

const badgeVariants = {
  accent: 'bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 border-accent-200 dark:border-accent-500/20',
  success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  ghost: 'bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent',
}

const dotColors = {
  accent: 'bg-accent-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-neutral-400',
  ghost: 'bg-neutral-400',
}

export const Badge = ({ variant = 'neutral', size = 'sm', dot = false, className, children, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 border rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-body-sm',
      badgeVariants[variant],
      className
    )}
    {...props}
  >
    {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
    {children}
  </span>
)

/* ─── Avatar ─── */
interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'online' | 'away' | 'offline'
  className?: string
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
}

const statusColors = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-neutral-400',
}

export const Avatar = ({ src, name, size = 'md', status, className }: AvatarProps) => (
  <div className={cn('relative flex-shrink-0', className)}>
    <div className={cn(
      'rounded-full overflow-hidden bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center',
      'border-2 border-white dark:border-neutral-900',
      avatarSizes[size]
    )}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-manrope font-semibold text-accent-600 dark:text-accent-400">
          {name ? getInitials(name) : '?'}
        </span>
      )}
    </div>
    {status && (
      <span className={cn(
        'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-neutral-900',
        statusColors[status],
        size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
      )} />
    )}
  </div>
)

/* ─── Spinner ─── */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <svg
    role="status"
    aria-label="Loading"
    className={cn('animate-spin text-accent-500', spinnerSizes[size], className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

/* ─── Divider ─── */
interface DividerProps {
  label?: string
  className?: string
}

export const Divider = ({ label, className }: DividerProps) => (
  <div className={cn('relative flex items-center', className)}>
    <div className="flex-1 border-t border-border-light dark:border-border-dark" />
    {label && (
      <span className="px-3 text-caption text-neutral-400 dark:text-neutral-600 bg-white dark:bg-neutral-900 whitespace-nowrap">
        {label}
      </span>
    )}
    <div className="flex-1 border-t border-border-light dark:border-border-dark" />
  </div>
)

export { default as NotificationBell } from './NotificationBell'
