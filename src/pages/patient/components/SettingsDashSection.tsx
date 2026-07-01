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

export function SettingsDashSection() {
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Settings</h1>
      <Card>
        <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Preferences</h2>
        <div className="space-y-4">
          {[
            { label: 'Appointment Reminders', desc: 'Get notified 1 day before your appointment', checked: true },
            { label: 'Medicine Reminders', desc: 'Daily medicine dose reminders', checked: true },
            { label: 'Report Notifications', desc: 'Notified when test reports are ready', checked: true },
            { label: 'Chat Notifications', desc: 'Instant messages from your doctor', checked: false },
          ].map(item => (
            <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-border-light dark:border-border-dark last:border-0">
              <div>
                <p className="font-medium text-body-md text-neutral-900 dark:text-neutral-100">{item.label}</p>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
              </div>
              <button className={cn('w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                item.checked ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-700'
              )}>
                <div className={cn('w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200',
                  item.checked ? 'translate-x-5.5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}