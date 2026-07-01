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

export function AppointmentsSection() {
  const { appointments } = useAppointmentStore()

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">My Appointments</h1>
      <div className="space-y-4">
        {appointments.map(appt => {
          const status = STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
          return (
            <Card key={appt.id} className="hover:shadow-soft-md transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity size={22} className="text-accent-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{appt.doctor?.name || 'Doctor'}</p>
                    <p className="text-body-sm text-accent-500 font-medium">Consultation</p>
                    <p className="text-caption text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar size={11} /> {formatDate(appt.date)} at {formatTime(appt.time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-caption text-neutral-400">Token</p>
                    <p className="font-manrope font-bold text-heading-md text-accent-500">#{appt.queue_token}</p>
                  </div>
                  <Badge variant={status.variant} dot>{status.label}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
        {appointments.length === 0 && <p className="text-neutral-500 py-4">No appointments found.</p>}
      </div>
    </div>
  )
}