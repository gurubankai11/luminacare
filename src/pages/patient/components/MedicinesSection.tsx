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

export function MedicinesSection() {
  const { prescriptions } = useMedicalStore()
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Prescriptions</h1>
      {prescriptions.map(rx => (
        <Card key={rx.id} className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">{rx.instructions?.split("\n")[0]?.replace("Diagnosis: ", "") || "Prescription"}</p>
              <p className="text-body-sm text-accent-600 dark:text-accent-400 font-medium mt-0.5">{rx.doctor?.name}</p>
              <p className="text-caption text-neutral-400 mt-0.5">{formatDate(rx.created_at)}</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
              Download PDF
            </Button>
          </div>

          <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="text-left px-4 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wide">Medicine</th>
                  <th className="text-center px-3 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wide">Morning</th>
                  <th className="text-center px-3 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wide">Afternoon</th>
                  <th className="text-center px-3 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wide">Night</th>
                  <th className="text-left px-4 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wide">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {rx.medicines?.map((med: any) => (
                  <tr key={med.name}>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{med.name}</td>
                    <td className="px-3 py-3 text-center">{med.morning ? '✅' : '—'}</td>
                    <td className="px-3 py-3 text-center">{med.afternoon ? '✅' : '—'}</td>
                    <td className="px-3 py-3 text-center">{med.night ? '✅' : '—'}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rx.instructions && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
              <p className="text-body-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Special Instructions</p>
              <p className="text-body-sm text-amber-700 dark:text-amber-300">{rx.instructions}</p>
            </div>
          )}
        </Card>
      ))}
      {prescriptions.length === 0 && <p className="text-neutral-500 py-4">No prescriptions found.</p>}
    </div>
  )
}