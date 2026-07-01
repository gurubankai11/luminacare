import { forwardRef, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

/* ─── Textarea ─── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'w-full bg-white dark:bg-neutral-900 border rounded-xl text-body-md resize-none',
          'text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600',
          'px-4 py-3 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-500/25 focus:border-accent-400',
          'hover:border-neutral-300 dark:hover:border-neutral-600',
          error
            ? 'border-rose-400 dark:border-rose-500'
            : 'border-border-light dark:border-border-dark',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-caption text-rose-600 dark:text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-caption text-neutral-500">{hint}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

/* ─── Select ─── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full appearance-none bg-white dark:bg-neutral-900 border rounded-xl text-body-md',
            'text-neutral-900 dark:text-neutral-100',
            'px-4 py-3 pr-10 transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/25 focus:border-accent-400',
            'hover:border-neutral-300 dark:hover:border-neutral-600',
            error
              ? 'border-rose-400 dark:border-rose-500'
              : 'border-border-light dark:border-border-dark',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-caption text-rose-600 dark:text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-caption text-neutral-500">{hint}</p>}
    </div>
  )
})
Select.displayName = 'Select'
