import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Clock, Pill, FileText, MessageSquare,
  Bell, Settings, User, LogOut, Activity,
  CheckCircle, AlertCircle, XCircle, Download, Send, Paperclip,
  Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { Avatar, Badge } from '../../../components/ui'
import Card, { StatCard } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useChatStore } from '../../../stores/chatStore'
import { useNotificationStore } from '../../../stores/notificationStore'
import { useAppointmentStore } from '../../../stores/appointmentStore'
import { useMedicalStore } from '../../../stores/medicalStore'
import { cn, formatDate, formatTime } from '../../../lib/utils'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', variant: 'accent' as const, icon: CheckCircle },
  completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
  pending: { label: 'Pending', variant: 'warning' as const, icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'danger' as const, icon: XCircle },
}

export function DashboardHome() {
  const { notifications } = useNotificationStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">Welcome back 👋</h1>
        <p className="text-body-md text-neutral-500 dark:text-neutral-400 mt-1">Here's your health overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value="2" change="Appointments" changeType="neutral" icon={<Calendar size={20} />} />
        <StatCard label="Queue Position" value="#3" change="~15 min wait" changeType="neutral" icon={<Clock size={20} />} />
        <StatCard label="Active Prescriptions" value="1" change="Review due" changeType="neutral" icon={<Pill size={20} />} />
        <StatCard label="Reports" value="3" change="1 needs review" changeType="down" icon={<FileText size={20} />} />
      </div>

      {/* Next appointment */}
      <Card className="border-accent-200 dark:border-accent-500/30 bg-gradient-to-br from-accent-50 to-white dark:from-accent-500/10 dark:to-neutral-900">
        <div className="flex items-center justify-between mb-1">
          <p className="text-caption text-neutral-500 uppercase tracking-wide font-medium">Next Appointment</p>
          <Badge variant="accent" dot>Confirmed</Badge>
        </div>
        <div className="flex items-start justify-between mt-3">
          <div>
            <p className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Dr. Arjun Mehta</p>
            <p className="text-body-sm text-accent-600 dark:text-accent-400 font-medium">Cardiologist</p>
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-2 flex items-center gap-2">
              <Calendar size={14} />
              July 15, 2026 at 10:30 AM
            </p>
          </div>
          <div className="text-center">
            <p className="text-caption text-neutral-400">Token</p>
            <p className="font-manrope font-bold text-display-sm text-accent-500">#3</p>
          </div>
        </div>
      </Card>

      {/* Recent notifications */}
      <div>
        <h2 className="section-title text-xl mb-4">Recent Notifications</h2>
        <div className="space-y-3">
          {notifications.slice(0, 2).map(n => (
            <div key={n.id} className={cn('flex gap-3 p-4 rounded-2xl border', n.read ? 'bg-white dark:bg-neutral-900 border-border-light dark:border-border-dark' : 'bg-accent-50 dark:bg-accent-500/10 border-accent-200 dark:border-accent-500/20')}>
              <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                <Bell size={14} className="text-accent-500" />
              </div>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</p>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 truncate">{n.message}</p>
                <p className="text-caption text-neutral-400 mt-1">{formatDate(n.created_at)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}