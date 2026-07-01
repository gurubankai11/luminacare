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

export function NotificationsSection() {
  const { notifications, fetchNotifications, markAsRead, subscribeToNotifications } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    const unsubscribe = subscribeToNotifications()
    return () => unsubscribe()
  }, [fetchNotifications, subscribeToNotifications])

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Notifications</h1>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} className={cn('flex gap-4 p-4 rounded-2xl border cursor-pointer transition-colors', n.read ? 'bg-white dark:bg-neutral-900 border-border-light dark:border-border-dark hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'bg-accent-50 dark:bg-accent-500/10 border-accent-200 dark:border-accent-500/20')}>
            <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-500/20 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-accent-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</p>
              <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{n.message}</p>
              <p className="text-caption text-neutral-400 mt-1">{formatDate(n.created_at)}</p>
            </div>
            {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-neutral-500 py-4">No notifications.</p>}
      </div>
    </div>
  )
}