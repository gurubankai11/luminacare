import { type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'hover' | 'interactive' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
}

const variantStyles = {
  base: 'bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark shadow-soft-sm',
  hover: 'bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-1',
  interactive: 'bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark shadow-soft-sm hover:shadow-card-hover hover:-translate-y-1.5 hover:border-accent-200 dark:hover:border-accent-600/40 cursor-pointer',
  glass: 'backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 border border-white/40 dark:border-white/10 shadow-soft-md',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

const Card = ({
  variant = 'base',
  padding = 'md',
  animate = false,
  className,
  children,
  ...props
}: CardProps) => {
  const classes = cn(
    'rounded-2xl transition-all duration-300',
    variantStyles[variant],
    paddingStyles[padding],
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={classes}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card

/* ─── Card sub-components ─── */
export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-manrope font-semibold text-heading-md text-neutral-900 dark:text-neutral-100', className)} {...props} />
)

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-body-sm text-neutral-500 dark:text-neutral-400 mt-1', className)} {...props} />
)

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props} />
)

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 pt-4 border-t border-border-light dark:border-border-dark flex items-center gap-3', className)} {...props} />
)

/* ─── Stat Card ─── */
interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export const StatCard = ({ label, value, change, changeType = 'neutral', icon, className }: StatCardProps) => (
  <Card className={className}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 font-medium">{label}</p>
        <p className="mt-1.5 font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">{value}</p>
        {change && (
          <p className={cn(
            'mt-1.5 text-caption font-medium flex items-center gap-1',
            changeType === 'up' && 'text-emerald-600 dark:text-emerald-400',
            changeType === 'down' && 'text-rose-600 dark:text-rose-400',
            changeType === 'neutral' && 'text-neutral-500 dark:text-neutral-400',
          )}>
            {changeType === 'up' && '↑'}
            {changeType === 'down' && '↓'}
            {change}
          </p>
        )}
      </div>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-500 dark:text-accent-400 flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  </Card>
)
