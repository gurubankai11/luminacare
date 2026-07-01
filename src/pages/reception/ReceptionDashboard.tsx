import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Clock, Calendar, Search, Printer, LogOut, Menu, X, Bell, Hash, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Avatar, Badge, NotificationBell, Spinner } from '../../components/ui'
import Card, { StatCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/FormElements'
import { cn, formatTime, formatDate, generateAppointmentNumber } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'walkin', label: 'Add Walk-in', icon: UserPlus },
  { id: 'queue', label: 'Queue Management', icon: Clock },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'search', label: 'Patient Search', icon: Search },
]

const STATUS_MAP = {
  completed: { label: 'Done', variant: 'success' as const },
  in_progress: { label: 'In Progress', variant: 'accent' as const },
  waiting: { label: 'Waiting', variant: 'warning' as const },
  cancelled: { label: 'Cancelled', variant: 'danger' as const },
}

function ReceptionSidebar({ active, onNavigate, onClose }: { active: string; onNavigate: (id: string) => void; onClose?: () => void }) {
  const { openSignOutModal } = useAuthStore()
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-border-light dark:border-border-dark">
      <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <span className="font-manrope font-bold text-base text-neutral-900 dark:text-neutral-100">Reception</span>
        {onClose && <button onClick={onClose} className="ml-auto text-neutral-400"><X size={16} /></button>}
      </div>
      <div className="px-4 py-4 border-b border-border-light dark:border-border-dark flex items-center gap-3">
        <Avatar name="Reception Staff" status="online" />
        <div><p className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">Reception Staff</p><p className="text-caption text-neutral-400">Front Desk</p></div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { onNavigate(id); onClose?.() }}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200',
              active === id ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border-light dark:border-border-dark">
        <button onClick={() => openSignOutModal()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
          <LogOut size={16} />Sign Out
        </button>
      </div>
    </div>
  )
}

function RecDashboard() {
  const { todayQueue } = useAppointmentStore()
  const waiting = todayQueue.filter(q => q.status === 'pending').length
  const walkins = todayQueue.filter(q => !q.time).length
  const cancelled = todayQueue.filter(q => q.status === 'cancelled').length

  return (
    <div className="space-y-6">
      <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">Reception Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Patients" value={todayQueue.length.toString()} icon={<UserPlus size={20} />} />
        <StatCard label="In Queue" value={waiting.toString()} icon={<Clock size={20} />} />
        <StatCard label="Walk-ins" value={walkins.toString()} icon={<Hash size={20} />} />
        <StatCard label="Cancelled" value={cancelled.toString()} changeType="down" icon={<XCircle size={20} />} />
      </div>
      <Card>
        <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Quick Queue View</h2>
        <div className="space-y-2">
          {todayQueue.slice(0, 5).map(q => {
            const s = STATUS_MAP[q.status === 'pending' ? 'waiting' : q.status as keyof typeof STATUS_MAP] || STATUS_MAP.waiting
            return (
              <div key={q.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="font-bold text-amber-500 w-6 text-body-sm text-center">#{q.queue_token}</span>
                <div className="flex-1">
                  <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{q.patient?.name}</p>
                  <p className="text-caption text-neutral-400">{q.symptoms || 'General Checkup'}</p>
                </div>
                <Badge variant={s.variant} dot size="sm">{s.label}</Badge>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function WalkInSection() {
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<{ apptNo: string; token: number } | null>(null)
  
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [time, setTime] = useState('')

  const { bookAppointment } = useAppointmentStore()

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'patient').then(({ data }) => setPatients(data || []))
    supabase.from('profiles').select('*').eq('role', 'doctor').then(({ data }) => setDoctors(data || []))
  }, [])

  const handleGenerate = async () => {
    if (!patientId || !doctorId || !time) {
      toast.error('Please select patient, doctor, and time slot')
      return
    }
    
    setLoading(true)
    try {
      const date = new Date().toISOString().split('T')[0] // Today's date for walk-ins
      
      const appt = await bookAppointment({
        patient_id: patientId,
        doctor_id: doctorId,
        date: date,
        time: time,
        symptoms: symptoms || 'Walk-in consultation'
      })

      if (appt) {
        setGenerated({ apptNo: appt.appointment_number, token: appt.queue_token })
        toast.success('Walk-in appointment added to queue')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Add Walk-in Patient</h1>
      {generated ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl p-8 text-center">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">Token Generated!</h2>
          <div className="mt-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6">
            <p className="text-caption text-neutral-500 mb-1">Appointment No.</p>
            <p className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">{generated.apptNo}</p>
            <p className="text-caption text-neutral-500 mt-4 mb-1">Queue Token Number</p>
            <p className="font-manrope font-extrabold text-6xl text-amber-500">#{generated.token}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="md" fullWidth leftIcon={<Printer size={14} />}>Print Token</Button>
            <Button variant="primary" size="md" fullWidth onClick={() => {
              setGenerated(null)
              setPatientId('')
              setSymptoms('')
            }}>Add Another</Button>
          </div>
        </motion.div>
      ) : (
        <Card>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">Registered Patient</label>
                <select className="h-10 px-3 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-xl" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone || 'No phone'})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">Doctor</label>
                <select className="h-10 px-3 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-xl" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'General'})</option>
                  ))}
                </select>
              </div>
              <Select label="Time Slot" required value={time} onChange={e => setTime(e.target.value)} options={[
                { value: '09:00', label: '09:00 AM' },
                { value: '09:30', label: '09:30 AM' },
                { value: '10:00', label: '10:00 AM' },
                { value: '10:30', label: '10:30 AM' },
                { value: '11:00', label: '11:00 AM' },
                { value: '11:30', label: '11:30 AM' },
                { value: '12:00', label: '12:00 PM' },
                { value: '14:00', label: '02:00 PM' },
                { value: '14:30', label: '02:30 PM' },
                { value: '15:00', label: '03:00 PM' }
              ]} placeholder="Select slot" />
            </div>
            <Input label="Chief Complaint" placeholder="Brief reason for visit" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
            <Button variant="primary" size="lg" onClick={handleGenerate} isLoading={loading} leftIcon={<Hash size={16} />}>Generate Real Token</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function QueueManagement() {
  const { todayQueue, updateStatus } = useAppointmentStore()
  
  return (
    <div className="space-y-6">
      <h1 className="page-title text-2xl">Queue Management</h1>
      <div className="space-y-3">
        {todayQueue.map(q => {
          const s = STATUS_MAP[q.status === 'pending' ? 'waiting' : q.status as keyof typeof STATUS_MAP] || STATUS_MAP.waiting
          return (
            <Card key={q.id} className="flex items-center gap-4 flex-wrap">
              <span className="font-manrope font-bold text-2xl text-amber-500 w-10 text-center">#{q.queue_token}</span>
              <Avatar name={q.patient?.name || 'Patient'} src={q.patient?.avatar_url} />
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{q.patient?.name}</p>
                <p className="text-body-sm text-neutral-500">{formatTime(q.time ? q.time + ':00' : '00:00:00')}</p>
              </div>
              <Badge variant={s.variant} dot>{s.label}</Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={() => updateStatus(q.id, 'cancelled')} leftIcon={<XCircle size={12} />}>Cancel</Button>
                {q.status !== 'completed' && <Button variant="primary" size="xs" onClick={() => updateStatus(q.id, 'completed')} leftIcon={<CheckCircle size={12} />}>Complete</Button>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PatientSearchSection() {
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
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id, date, queue_token, symptoms,
            patient:profiles!appointments_patient_id_fkey!inner(name),
            doctor:profiles!appointments_doctor_id_fkey(name)
          `)
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
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

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
              <p className="text-body-sm text-neutral-500">
                {formatDate(p.date)} · Token #{p.queue_token} · {p.symptoms} {p.doctor?.name ? `(Dr. ${p.doctor.name})` : ''}
              </p>
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

const REC_SECTIONS: Record<string, React.ReactNode> = {
  dashboard: <RecDashboard />,
  walkin: <WalkInSection />,
  queue: <QueueManagement />,
  appointments: <div className="p-8 text-neutral-500 text-center">Appointments view (same structure as patient appointments)</div>,
  search: <PatientSearchSection />,
}

export default function ReceptionDashboard() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentNav = NAV_ITEMS.find(n => n.id === active)
  const { fetchTodayQueue, subscribeToQueue } = useAppointmentStore()

  useEffect(() => {
    fetchTodayQueue()
    const unsub = subscribeToQueue()
    return () => unsub()
  }, [fetchTodayQueue, subscribeToQueue])

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex">
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <ReceptionSidebar active={active} onNavigate={setActive} />
      </div>
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <ReceptionSidebar active={active} onNavigate={setActive} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
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
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {REC_SECTIONS[active]}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
