import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, Search, FileText, FlaskConical,
  BarChart2, MessageSquare, Settings, LogOut, Download, ChevronRight,
  Menu, X, Bell, Plus, CheckCircle, AlertCircle
} from 'lucide-react'
import { Avatar, Badge, NotificationBell, Spinner } from '../../components/ui'
import Card, { StatCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Textarea } from '../../components/ui/FormElements'
import { cn, formatTime, formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { pdf } from '@react-pdf/renderer'
import { PrescriptionPDF } from '../../components/pdf/PrescriptionPDF'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useMedicalStore } from '../../stores/medicalStore'
import { useChatStore } from '../../stores/chatStore'
import { useEffect, useMemo } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue', label: "Today's Queue", icon: Clock },
  { id: 'patients', label: 'Patient Search', icon: Search },
  { id: 'prescriptions', label: 'Write Prescription', icon: FileText },
  { id: 'tests', label: 'Recommend Tests', icon: FlaskConical },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
]



const STATUS_MAP = {
  completed: { label: 'Completed', variant: 'success' as const },
  in_progress: { label: 'In Progress', variant: 'accent' as const },
  waiting: { label: 'Waiting', variant: 'warning' as const },
}

/* ─── Sidebar ─── */
function DoctorSidebar({ active, onNavigate, onClose }: { active: string; onNavigate: (id: string) => void; onClose?: () => void }) {
  const { openSignOutModal, user } = useAuthStore()
  const navigate = useNavigate()
  const doctorName = user?.name || 'Doctor'
  const doctorSpecialty = user?.specialty || 'Physician'
  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white">
      <div className="p-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-manrope font-bold text-base text-white">LuminaCare</span>
          {onClose && <button onClick={onClose} className="ml-auto p-1 rounded text-neutral-500 hover:text-white"><X size={16} /></button>}
        </div>
      </div>
      <div className="px-4 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Avatar name={doctorName} status="online" size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-body-sm text-white truncate">{doctorName}</p>
            <p className="text-caption text-emerald-400">{doctorSpecialty}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { onNavigate(id); onClose?.() }}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200',
              active === id ? 'bg-accent-500/20 text-accent-400' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )}>
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-neutral-800">
        <button onClick={() => openSignOutModal()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-200">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

/* ─── Dashboard ─── */
function DoctorDashboardHome() {
  const { todayQueue } = useAppointmentStore()
  const completed = todayQueue.filter(q => q.status === 'completed').length
  const waiting = todayQueue.filter(q => q.status === 'pending').length
  const currentPatient = todayQueue.find(q => q.status === 'in_progress')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">Good Morning, Doctor 👋</h1>
          <p className="text-body-md text-neutral-500 dark:text-neutral-400 mt-1">You have {todayQueue.length} patients today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Export Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Patients" value={todayQueue.length.toString()} icon={<Users size={20} />} />
        <StatCard label="Completed" value={completed.toString()} changeType="up" change="on time" icon={<CheckCircle size={20} />} />
        <StatCard label="In Queue" value={waiting.toString()} icon={<Clock size={20} />} />
        <StatCard label="Avg Wait Time" value="12m" icon={<AlertCircle size={20} />} />
      </div>

      {/* Current patient */}
      {currentPatient ? (
        <Card className="border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-neutral-900">
          <div className="flex items-center gap-1 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-body-sm font-semibold text-emerald-700 dark:text-emerald-400">Current Patient</p>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">{currentPatient.patient?.name || 'Patient'}</p>
              <p className="text-body-sm text-neutral-500 dark:text-neutral-400">Token #{currentPatient.queue_token} | {currentPatient.symptoms}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Write Rx</Button>
              <Button variant="outline" size="sm">View History</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900/50">
          <p className="text-neutral-500">No active consultation.</p>
        </Card>
      )}

      {/* Queue preview */}
      <Card>
        <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Today's Queue</h2>
        <div className="space-y-2">
          {todayQueue.slice(0, 4).map(p => {
            const s = STATUS_MAP[p.status as keyof typeof STATUS_MAP] || { label: p.status, variant: 'neutral' }
            return (
              <div key={p.id} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                p.status === 'in_progress' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
              )}>
                <span className="font-bold text-accent-500 w-6 text-center text-body-sm">#{p.queue_token}</span>
                <Avatar name={p.patient?.name || 'Patient'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{p.patient?.name || 'Patient'}</p>
                  <p className="text-caption text-neutral-400">{p.symptoms}</p>
                </div>
                <Badge variant={s.variant as any} size="sm">{s.label}</Badge>
              </div>
            )
          })}
          {todayQueue.length === 0 && <p className="text-neutral-500 py-4 text-center">No patients in queue today.</p>}
        </div>
      </Card>
    </div>
  )
}

function QueueSection() {
  const { todayQueue, updateStatus } = useAppointmentStore()
  const currentToken = todayQueue.find(q => q.status === 'in_progress')?.queue_token

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Today's Patient Queue</h1>
      <div className="space-y-3">
        {todayQueue.map(p => {
          const s = STATUS_MAP[p.status as keyof typeof STATUS_MAP] || { label: p.status, variant: 'neutral' }
          return (
            <Card key={p.id} className={cn(p.queue_token === currentToken && 'border-emerald-300 dark:border-emerald-500/40 shadow-soft-md')}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-manrope font-bold text-accent-600 dark:text-accent-400 text-body-md">#{p.queue_token}</span>
                </div>
                <Avatar name={p.patient?.name || 'Patient'} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{p.patient?.name || 'Patient'}</p>
                  <p className="text-body-sm text-neutral-500">{p.symptoms} · {formatTime(p.time + ':00')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.variant as any} dot>{s.label}</Badge>
                  {(p.status === 'pending') && (
                    <Button variant="primary" size="xs" onClick={() => updateStatus(p.id, 'in_progress')}>Call In</Button>
                  )}
                  {p.status === 'in_progress' && (
                    <Button variant="success" size="xs" onClick={() => updateStatus(p.id, 'completed')}>Complete</Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {todayQueue.length === 0 && <p className="text-neutral-500 text-center py-4">No queue data.</p>}
      </div>
    </div>
  )
}

function PatientSearchSection() {
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        // Debounced server-side search using .ilike()
        // We use an inner join to filter by patient name
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id, date, queue_token, symptoms,
            patient:profiles!appointments_patient_id_fkey!inner(name)
          `)
          .eq('doctor_id', user?.id)
          .or(`symptoms.ilike.%${query}%,patient.name.ilike.%${query}%`)
          .order('date', { ascending: false })
          .limit(20)
        
        if (error) throw error
        setResults(data || [])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [query, user?.id])

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Patient Search</h1>
      <Input 
        placeholder="Search patient by name, issue... (server-side)" 
        leftIcon={loading ? <Spinner size="sm" /> : <Search size={16} />} 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
      />
      <div className="space-y-3">
        {results.map(p => (
          <Card key={p.id} className="flex items-center gap-4 cursor-pointer hover:shadow-soft-md transition-shadow">
            <Avatar name={p.patient?.name || 'Patient'} />
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{p.patient?.name || 'Patient'}</p>
              <p className="text-body-sm text-neutral-500">{formatDate(p.date)} · Token #{p.queue_token} · {p.symptoms}</p>
            </div>
            <ChevronRight size={16} className="text-neutral-400" />
          </Card>
        ))}
        {query.trim() && results.length === 0 && !loading && (
          <p className="text-neutral-500 text-center py-8">No patients found.</p>
        )}
        {!query.trim() && (
          <p className="text-neutral-500 text-center py-8">Type to search for patients...</p>
        )}
      </div>
    </div>
  )
}

function PrescriptionWriter() {
  const { addPrescription } = useMedicalStore()
  const { todayQueue } = useAppointmentStore()
  const [patientId, setPatientId] = useState('')
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', morning: false, afternoon: false, night: false, duration: '' }])
  const [diagnosis, setDiagnosis] = useState('')
  const [instructions, setInstructions] = useState('')
  const addMedicine = () => setMedicines(m => [...m, { name: '', dosage: '', morning: false, afternoon: false, night: false, duration: '' }])

  const handleSave = async () => {
    if (!patientId) {
      toast.error('Please select a patient')
      return
    }
    await addPrescription({
      patient_id: patientId,
      instructions,
      medicines
    })
    setMedicines([{ name: '', dosage: '', morning: false, afternoon: false, night: false, duration: '' }])
    setDiagnosis('')
    setInstructions('')
    toast.success('Prescription saved successfully!')
  }

  const handleGeneratePDF = async () => {
    if (!patientId) {
      toast.error('Please select a patient first')
      return
    }
    const patient = todayQueue.find(q => q.patient_id === patientId)?.patient
    const patientName = patient?.name || 'Patient'
    const docName = useAuthStore.getState().user?.name || 'Doctor'
    const docSpecialty = useAuthStore.getState().user?.specialty || 'Specialist'
    
    try {
      const blob = await pdf(
        <PrescriptionPDF 
          doctorName={`Dr. ${docName}`}
          doctorSpecialty={docSpecialty}
          patientName={patientName}
          date={formatDate(new Date().toISOString())}
          diagnosis={diagnosis}
          medicines={medicines}
          instructions={instructions}
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Prescription_${patientName.replace(/\s+/g, '_')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('PDF Generated!')
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to generate PDF')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Write Prescription</h1>
      <Card>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">Patient</label>
              <select className="h-10 px-3 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-xl" value={patientId} onChange={e => setPatientId(e.target.value)}>
                <option value="">Select patient...</option>
                {todayQueue.map(q => (
                  <option key={q.patient_id} value={q.patient_id}>{q.patient?.name}</option>
                ))}
              </select>
            </div>
            <Input label="Diagnosis / Condition" placeholder="e.g., Hypertension" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-body-md text-neutral-900 dark:text-neutral-100">Medicines</p>
              <Button variant="ghost" size="xs" leftIcon={<Plus size={13} />} onClick={addMedicine}>Add Medicine</Button>
            </div>
            <div className="space-y-4">
              {medicines.map((med, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Medicine Name" placeholder="e.g., Amlodipine 5mg" value={med.name} onChange={e => {
                      const newMeds = [...medicines]; newMeds[i].name = e.target.value; setMedicines(newMeds);
                    }} />
                    <Input label="Dosage" placeholder="e.g., 1 tablet" value={med.dosage} onChange={e => {
                      const newMeds = [...medicines]; newMeds[i].dosage = e.target.value; setMedicines(newMeds);
                    }} />
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <p className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">Timing:</p>
                    {['morning', 'afternoon', 'night'].map(t => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-accent-500 rounded" checked={med[t as keyof typeof med] as boolean}
                          onChange={e => {
                            const newMeds = [...medicines]; (newMeds[i] as any)[t] = e.target.checked; setMedicines(newMeds);
                          }} />
                        <span className="text-body-sm text-neutral-600 dark:text-neutral-400 capitalize">{t}</span>
                      </label>
                    ))}
                    <Input label="" placeholder="Duration (e.g., 30 days)" className="flex-1 min-w-[120px]" value={med.duration} onChange={e => {
                      const newMeds = [...medicines]; newMeds[i].duration = e.target.value; setMedicines(newMeds);
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea label="Special Instructions" placeholder="Dietary restrictions, follow-ups, warnings..." rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} />

          <div className="flex gap-3">
            <Button variant="primary" size="md" leftIcon={<CheckCircle size={15} />} onClick={handleSave}>Save Prescription</Button>
            <Button variant="outline" size="md" leftIcon={<Download size={15} />} onClick={handleGeneratePDF}>Generate PDF</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function TestsSection() {
  const TEST_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Urine Test', 'Culture Test']
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Recommend Tests</h1>
      <Card>
        <div className="space-y-5">
          <Input label="Patient" placeholder="Search patient..." leftIcon={<Search size={15} />} />
          <div>
            <p className="font-semibold text-body-md text-neutral-900 dark:text-neutral-100 mb-3">Select Tests</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TEST_TYPES.map(t => (
                <label key={t} className="flex items-center gap-2.5 p-3 border border-border-light dark:border-border-dark rounded-xl cursor-pointer hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-all">
                  <input type="checkbox" className="w-4 h-4 accent-accent-500 rounded" />
                  <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <Textarea label="Clinical Notes" placeholder="Reason for tests, urgency level..." rows={3} />
          <Button variant="primary" size="md">Send Test Recommendations</Button>
        </div>
      </Card>
    </div>
  )
}

function AnalyticsSection() {
  const { appointments } = useAppointmentStore()
  const { prescriptions } = useMedicalStore()

  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth()
    const thisMonthAppts = appointments.filter(a => new Date(a.date).getMonth() === thisMonth)
    return {
      patients: thisMonthAppts.length,
      prescriptions: prescriptions.length,
    }
  }, [appointments, prescriptions])

  // Compute monthly volume based on actual appointments for the last 6 months
  const monthlyVolume = useMemo(() => {
    const months = []
    const labels = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIndex = d.getMonth()
      const year = d.getFullYear()
      labels.push(d.toLocaleString('default', { month: 'short' }))
      const count = appointments.filter(a => {
        const ad = new Date(a.date)
        return ad.getMonth() === monthIndex && ad.getFullYear() === year
      }).length
      months.push(count)
    }
    return { data: months, labels }
  }, [appointments])

  const maxVolume = Math.max(...monthlyVolume.data, 10)

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Month" value={stats.patients.toString()} change="Patients" changeType="up" icon={<Users size={20} />} />
        <StatCard label="Avg Rating" value="4.9" change="★ Reviews" changeType="up" icon={<BarChart2 size={20} />} />
        <StatCard label="Prescriptions" value={stats.prescriptions.toString()} change="Written" changeType="neutral" icon={<FileText size={20} />} />
        <StatCard label="Tests Ordered" value="—" icon={<FlaskConical size={20} />} />
      </div>
      <Card>
        <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Monthly Patient Volume</h2>
        <div className="flex items-end gap-1.5 h-32">
          {monthlyVolume.data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-neutral-400">{v}</span>
              <div className="w-full bg-accent-200 dark:bg-accent-500/30 hover:bg-accent-500 transition-colors rounded-t-md cursor-pointer" style={{ height: `${(v / maxVolume) * 100}%` }} title={`${monthlyVolume.labels[i]}: ${v} patients`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {monthlyVolume.labels.map(m => (
            <span key={m} className="text-xs text-neutral-400 flex-1 text-center">{m}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ChatSection() {
  const { messages, fetchMessages, sendMessage, subscribeToMessages } = useChatStore()
  const { user } = useAuthStore()
  const { todayQueue } = useAppointmentStore()
  const [message, setMessage] = useState('')
  const [patientId, setPatientId] = useState('')

  const selectedPatient = todayQueue.find(q => q.patient_id === patientId)
  const patientName = selectedPatient?.patient?.name || 'Select Patient'
  useEffect(() => {
    if (user?.id && patientId) {
      fetchMessages(user.id, patientId)
      const unsubscribe = subscribeToMessages(user.id, patientId)
      return () => unsubscribe()
    }
  }, [fetchMessages, subscribeToMessages, user?.id, patientId])

  const handleSend = () => {
    if (!message.trim() || !patientId) return
    sendMessage(message, patientId)
    setMessage('')
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl">Chat with Patient</h1>
        <select className="h-9 px-3 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-xl text-sm" value={patientId} onChange={e => setPatientId(e.target.value)}>
          <option value="">Select patient...</option>
          {todayQueue.map(q => (
            <option key={q.patient_id} value={q.patient_id}>{q.patient?.name}</option>
          ))}
        </select>
      </div>

      <Card className="flex-1 flex flex-col">
        {patientId ? (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-border-light dark:border-border-dark">
              <Avatar name={patientName} />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{patientName}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 py-4 overflow-y-auto min-h-[300px] max-h-[400px]">
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id
                return (
                  <div key={msg.id} className={cn('flex gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
                    {!isMe && <Avatar name={patientName} size="sm" />}
                    <div className={cn('max-w-xs rounded-2xl px-4 py-3 text-body-sm',
                      isMe
                        ? 'bg-accent-500 text-white rounded-tr-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm'
                    )}>
                      <p>{msg.message}</p>
                      <p className={cn('text-xs mt-1', isMe ? 'text-blue-100' : 'text-neutral-400')}>{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && <p className="text-center text-neutral-500 py-8">No messages yet.</p>}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark">
              <div className="flex-1">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              <Button variant="primary" size="sm" className="rounded-xl" onClick={handleSend}>
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            Please select a patient from the dropdown to start chatting.
          </div>
        )}
      </Card>
    </div>
  )
}

const DOCTOR_SECTIONS: Record<string, ReactNode> = {
  dashboard: <DoctorDashboardHome />,
  queue: <QueueSection />,
  patients: <PatientSearchSection />,
  prescriptions: <PrescriptionWriter />,
  tests: <TestsSection />,
  reports: <AnalyticsSection />,
  chat: <ChatSection />,
  settings: <div className="text-neutral-500 p-8 text-center">Settings section</div>,
}

export default function DoctorDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { fetchAppointments, fetchTodayQueue, subscribeToQueue } = useAppointmentStore()
  const { fetchPrescriptions } = useMedicalStore()

  useEffect(() => {
    fetchAppointments()
    fetchTodayQueue()
    fetchPrescriptions()
    const unsub = subscribeToQueue()
    return () => unsub()
  }, [fetchAppointments, fetchTodayQueue, subscribeToQueue, fetchPrescriptions])

  const currentNav = NAV_ITEMS.find(n => n.id === activeSection)

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex">
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <DoctorSidebar active={activeSection} onNavigate={setActiveSection} />
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <DoctorSidebar active={activeSection} onNavigate={setActiveSection} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark px-4 sm:px-6 h-14 flex items-center gap-4">
          <button className="lg:hidden p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h2 className="font-manrope font-semibold text-neutral-900 dark:text-neutral-100">{currentNav?.label}</h2>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Link to="/" className="text-caption text-neutral-400 hover:text-accent-500 hidden sm:block">← Back to Site</Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}>
              {DOCTOR_SECTIONS[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
