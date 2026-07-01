import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightAction?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  rightAction,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white dark:bg-neutral-900 border rounded-xl text-body-md',
            'text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/25 focus:border-accent-400 dark:focus:border-accent-400',
            'hover:border-neutral-300 dark:hover:border-neutral-600',
            error
              ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-500/5 focus:ring-rose-400/25'
              : 'border-border-light dark:border-border-dark',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon || rightAction ? 'pr-10' : 'pr-4',
            'py-3',
            className
          )}
          {...props}
        />

        {rightIcon && !rightAction && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {rightIcon}
          </div>
        )}

        {rightAction && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-caption text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-caption text-neutral-500 dark:text-neutral-500">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
