import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Clock, Pill, FileText, MessageSquare,
  Bell, Settings, User, LogOut, Activity,
  CheckCircle, AlertCircle, XCircle, Download, Send, Paperclip,
  Menu, X, Sun, Moon
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { Avatar, Badge, NotificationBell } from '../../components/ui'
import Card, { StatCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useChatStore } from '../../stores/chatStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useMedicalStore } from '../../stores/medicalStore'
import { cn, formatDate, formatTime } from '../../lib/utils'

import { DashboardHome } from './components/DashboardHome'
import { AppointmentsSection } from './components/AppointmentsSection'
import { QueueSection } from './components/QueueSection'
import { MedicinesSection } from './components/MedicinesSection'
import { ReportsSection } from './components/ReportsSection'
import { ChatSection } from './components/ChatSection'
import { NotificationsSection } from './components/NotificationsSection'
import { ProfileSection } from './components/ProfileSection'
import { SettingsDashSection } from './components/SettingsDashSection'

/* ─── Sidebar Nav ─── */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'queue', label: 'Live Queue', icon: Clock },
  { id: 'medicines', label: 'Prescriptions', icon: Pill },
  { id: 'reports', label: 'Test Reports', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
]


const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', variant: 'accent' as const, icon: CheckCircle },
  completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
  pending: { label: 'Pending', variant: 'warning' as const, icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'danger' as const, icon: XCircle },
}

/* ─── Sidebar ─── */
function Sidebar({ active, onNavigate, onClose }: { active: string; onNavigate: (id: string) => void; onClose?: () => void }) {
  const { user, openSignOutModal } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = () => {
    openSignOutModal()
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-border-light dark:border-border-dark">
      {/* Logo */}
      <div className="p-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center shadow-glow-accent-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-manrope font-bold text-base text-neutral-900 dark:text-neutral-100">
            Lumina<span className="text-accent-500">Care</span>
          </span>
          {onClose && (
            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400" aria-label="Close sidebar">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name || 'Patient'} status="online" />
          <div className="min-w-0">
            <p className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100 truncate">{user?.name || 'Demo Patient'}</p>
            <p className="text-caption text-neutral-400 truncate">{user?.email || 'patient@demo.in'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Patient dashboard navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onNavigate(id); onClose?.() }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200',
              active === id
                ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border-light dark:border-border-dark">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

/* ─── Section Map ─── */
const SECTIONS: Record<string, ReactNode> = {
  dashboard: <DashboardHome />,
  appointments: <AppointmentsSection />,
  queue: <QueueSection />,
  medicines: <MedicinesSection />,
  reports: <ReportsSection />,
  chat: <ChatSection />,
  notifications: <NotificationsSection />,
  profile: <ProfileSection />,
  settings: <SettingsDashSection />,
}

/* ─── Patient Dashboard ─── */
export default function PatientDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { fetchAppointments, fetchTodayQueue, subscribeToQueue } = useAppointmentStore()
  const { fetchPrescriptions, fetchRecords } = useMedicalStore()
  const { resolvedTheme, setTheme } = useThemeStore()
  const isDark = resolvedTheme() === 'dark'

  useEffect(() => {
    fetchAppointments()
    fetchTodayQueue()
    fetchPrescriptions()
    fetchRecords()
    const unsub = subscribeToQueue()
    return () => unsub()
  }, [fetchAppointments, fetchTodayQueue, fetchPrescriptions, fetchRecords, subscribeToQueue])

  const currentNav = NAV_ITEMS.find(n => n.id === activeSection)

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar active={activeSection} onNavigate={setActiveSection} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <Sidebar active={activeSection} onNavigate={setActiveSection} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            className="lg:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h2 className="font-manrope font-semibold text-neutral-900 dark:text-neutral-100">
            {currentNav?.label}
          </h2>
          <div className="flex-1" />

          <div className="ml-auto flex items-center gap-2">
            {/* Theme Toggle */}
            <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Actions */}
            <NotificationBell />
            <Link to="/" className="text-caption text-neutral-400 hover:text-accent-500 transition-colors hidden sm:block">
              ← Back to Site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            >
              {SECTIONS[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
