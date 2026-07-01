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

export function QueueSection() {
  const { todayQueue } = useAppointmentStore()
  
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Live Queue</h1>
      <Card className="border-accent-200 dark:border-accent-500/30">
        <div className="text-center py-4">
          <p className="text-caption text-neutral-500 uppercase tracking-widest mb-2">Current Queue Status</p>
          <p className="font-manrope font-extrabold text-5xl text-accent-500 mb-2">{todayQueue.length} Patients</p>
          <Badge variant="success" dot>Active</Badge>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Today's Tokens</h2>
        <div className="space-y-3">
          {todayQueue.map(p => (
            <div key={p.id} className={cn('flex items-center gap-3 p-3 rounded-xl', p.status === 'in_progress' ? 'bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20' : 'bg-neutral-50 dark:bg-neutral-800')}>
              <span className={cn('font-manrope font-bold w-8 text-center', p.status === 'in_progress' ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400')}>{p.queue_token}</span>
              <Avatar name={p.doctor?.name || 'Doctor'} size="sm" />
              <div className="flex-1">
                <p className={cn('font-medium text-body-sm', p.status === 'in_progress' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-700 dark:text-neutral-300')}>{p.doctor?.name || 'Doctor'}</p>
                <p className="text-caption text-neutral-500">{formatTime(p.time)}</p>
              </div>
              {p.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />}
            </div>
          ))}
          {todayQueue.length === 0 && <p className="text-neutral-500 py-4 text-center">No patients in queue today.</p>}
        </div>
      </Card>
    </div>
  )
}