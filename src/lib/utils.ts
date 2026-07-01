import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null, fmt = 'MMM d, yyyy') {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return format(d, fmt)
}

export function formatTime(time: string | undefined | null) {
  if (!time) return 'N/A'
  const parts = time.split(':')
  if (parts.length < 2) return time
  const [hours, minutes] = parts
  const h = parseInt(hours)
  if (isNaN(h)) return time
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function timeAgo(date: string | Date | undefined | null) {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function generateAppointmentNumber() {
  const prefix = 'LC'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function generateTokenNumber(existing: number) {
  return existing + 1
}

export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const APPOINTMENT_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

export const APPOINTMENT_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'accent',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'danger',
} as const

export const TEST_TYPE_LABELS = {
  blood_test: 'Blood Test',
  xray: 'X-Ray',
  mri: 'MRI',
  ct_scan: 'CT Scan',
  ultrasound: 'Ultrasound',
  ecg: 'ECG',
  other: 'Other',
} as const

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
]

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]
