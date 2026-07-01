import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Clock, Pill, FileText, MessageSquare,
  Bell, Settings, User, LogOut, Activity,
  CheckCircle, AlertCircle, XCircle, Download, Send, Paperclip,
  Menu, X, FileImage, FileIcon
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

function getFileIcon(type: string) {
  if (type.includes('image')) return <FileImage size={22} />
  return <FileIcon size={22} />
}

export function ReportsSection() {
  const { records } = useMedicalStore()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl">Test Reports</h1>
        <Button variant="outline" size="sm">Upload Report</Button>
      </div>
      <div className="space-y-3">
        {records.map(r => (
          <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-soft-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                {getFileIcon(r.report_type || 'default')}
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{r.name}</p>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(r.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {r.status === 'review' && <Badge variant="warning" dot>Review Required</Badge>}
              <Button variant="secondary" size="sm" fullWidth className="sm:w-auto" onClick={() => window.open(r.file_url || '#', '_blank')} leftIcon={<Download size={14} />}>PDF</Button>
            </div>
          </Card>
        ))}
        {records.length === 0 && <p className="text-neutral-500 py-4">No reports found.</p>}
      </div>
    </div>
  )
}