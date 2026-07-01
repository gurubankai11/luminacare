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

export function ProfileSection() {
  const { user } = useAuthStore()
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">My Profile</h1>
      <Card className="flex items-center gap-5">
        <Avatar name={user?.name || 'Patient'} size="2xl" />
        <div>
          <p className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">{user?.name || 'Demo Patient'}</p>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{user?.email || 'patient@demo.in'}</p>
          <Badge variant="accent" dot className="mt-2">Patient</Badge>
        </div>
        <Button variant="outline" size="sm" className="ml-auto">Edit Profile</Button>
      </Card>
      <div className="grid sm:grid-cols-2 gap-4">
        {[['Phone', user?.phone || '+91 98765 43210'], ['Blood Group', 'B+'], ['Date of Birth', 'Jan 15, 1990'], ['Allergies', 'None known']].map(([label, value]) => (
          <Card key={label} padding="sm">
            <p className="text-caption text-neutral-400 uppercase tracking-wide">{label}</p>
            <p className="font-semibold text-body-md text-neutral-900 dark:text-neutral-100 mt-1">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}