import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, BarChart2, DollarSign,
  MapPin, Settings, Shield, LogOut, Menu, X, Bell, TrendingUp,
  UserPlus, Activity, Building2, MoreHorizontal, Mail, Check, Trash2, Search, Reply
} from 'lucide-react'
import { Avatar, Badge, NotificationBell } from '../../components/ui'
import Card, { StatCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import SystemModule from '../../components/admin/SystemModule'
import DataBox from '../../components/admin/DataBox'
import { useEffect } from 'react'
import DoctorsManagementSection from './components/DoctorsManagementSection'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'doctors', label: 'Doctors', icon: UserCheck },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]



function AdminSidebar({ active, onNavigate, onClose }: { active: string; onNavigate: (id: string) => void; onClose?: () => void }) {
  const { openSignOutModal } = useAuthStore()
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white">
      <div className="p-5 border-b border-neutral-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <span className="font-manrope font-bold text-base text-white">LuminaCare Admin</span>
        {onClose && <button onClick={onClose} className="ml-auto text-neutral-500 hover:text-white"><X size={16} /></button>}
      </div>
      <div className="px-4 py-4 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center"><Shield size={16} className="text-purple-400" /></div>
        <div><p className="font-semibold text-body-sm text-white">System Admin</p><p className="text-caption text-purple-400">Super Admin</p></div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { onNavigate(id); onClose?.() }}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200',
              active === id ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-neutral-800">
        <button onClick={() => openSignOutModal()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut size={16} />Sign Out
        </button>
      </div>
    </div>
  )
}

function AdminDashboardHome({ doctors }: { doctors: any[] }) {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    branches: 0,
    loading: true
  })

  useEffect(() => {
    async function loadStats() {
      const [pts, appts, brs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('branches').select('id', { count: 'exact', head: true })
      ])
      setStats({
        patients: pts.count || 0,
        appointments: appts.count || 0,
        branches: brs.count || 0,
        loading: false
      })
    }
    loadStats()
  }, [])

  const STATS = [
    { label: 'Total Patients', value: stats.loading ? '...' : stats.patients.toLocaleString(), change: 'System wide', changeType: 'neutral' as const, icon: <Users size={20} /> },
    { label: 'Active Doctors', value: doctors.length.toString(), change: 'System wide', changeType: 'neutral' as const, icon: <UserCheck size={20} /> },
    { label: 'Total Revenue', value: stats.loading ? '...' : `₹${(stats.appointments * 500).toLocaleString()}`, change: 'Est. ₹500/appt', changeType: 'up' as const, icon: <DollarSign size={20} /> },
    { label: 'Branches', value: stats.loading ? '...' : stats.branches.toString(), change: 'Operational', changeType: 'neutral' as const, icon: <Building2 size={20} /> },
    { label: "Total Appointments", value: stats.loading ? '...' : stats.appointments.toString(), change: 'All time', changeType: 'up' as const, icon: <Activity size={20} /> },
    { label: 'Satisfaction Score', value: '4.9★', change: 'Consistent', changeType: 'up' as const, icon: <TrendingUp size={20} /> },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">Admin Overview</h1>
          <p className="text-body-md text-neutral-500 dark:text-neutral-400 mt-1">LuminaCare — System Dashboard</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doctor performance */}
        <Card>
          <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Active Doctors</h2>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
            {doctors.map((doc, i) => (
              <div key={doc.id} className="flex items-center gap-3">
                <span className="text-body-sm font-bold text-neutral-400 w-5">{i + 1}</span>
                <Avatar name={doc.name || ''} src={doc.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100 truncate">{doc.name}</p>
                  <p className="text-caption text-neutral-400">{doc.specialty}</p>
                </div>
                <span className="text-body-sm font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </Card>
        {/* Revenue chart (Placeholder dynamic approach) */}
        <Card>
          <h2 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-4">Patient Volume Trends</h2>
          <div className="flex items-end gap-2 h-32">
            {[20, 35, 25, 45, 60, Math.max(10, stats.patients)].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-neutral-400">{v}</span>
                <div className="w-full bg-purple-200 dark:bg-purple-500/30 hover:bg-purple-500 transition-colors rounded-t-md" style={{ height: `${Math.min(100, (v / Math.max(100, stats.patients)) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => (
              <span key={m} className="text-xs text-neutral-400 flex-1 text-center">{m}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}



function BranchesSection({ branches }: { branches: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl">Branches</h1>
        <Button variant="primary" size="sm" leftIcon={<MapPin size={14} />}>Add Branch</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map(b => (
          <Card key={b.id} className="hover:shadow-soft-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><Building2 size={20} className="text-purple-500" /></div>
              <Badge variant={b.status === 'open' ? 'success' : 'warning'} dot>{b.status}</Badge>
            </div>
            <h3 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100">{b.name}</h3>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div><p className="text-caption text-neutral-400">Patients</p><p className="font-bold text-body-md text-neutral-900 dark:text-neutral-100">{b.patients?.toLocaleString() || 0}</p></div>
              <div><p className="text-caption text-neutral-400">Doctors</p><p className="font-bold text-body-md text-neutral-900 dark:text-neutral-100">{b.doctors || 0}</p></div>
              <div><p className="text-caption text-neutral-400">Revenue</p><p className="font-bold text-body-md text-neutral-900 dark:text-neutral-100">{b.revenue || '₹0L'}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MessagesSection() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      setFetchError(error.message)
    }
    if (data) setMessages(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id)
    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m))
      toast.success('Message marked as read')
    }
  }

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
    if (!error) {
      setMessages(messages.filter(m => m.id !== id))
      toast.success('Message deleted')
    } else {
      toast.error('Failed to delete message')
    }
  }

  const handleReply = () => {
    toast('Reply feature coming soon', { icon: '🚧' })
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread' && m.is_read) return false
    if (filter === 'read' && !m.is_read) return false
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading messages...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="page-title text-2xl">Contact Messages</h1>
          <Badge variant="accent" dot>{messages.length} Total</Badge>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === f
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <Input 
        placeholder="Search messages by name, email, or subject..." 
        leftIcon={<Search size={16} />}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      <div className="grid gap-4">
        {fetchError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl border border-rose-200 dark:border-rose-800">
            Error loading messages: {fetchError}
          </div>
        )}
        {filteredMessages.length === 0 && !fetchError ? (
          <div className="p-8 text-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-2xl border border-border-light dark:border-border-dark">No messages found.</div>
        ) : (
          filteredMessages.map(msg => (
            <Card key={msg.id} className={cn("transition-colors", msg.is_read ? "opacity-75 bg-neutral-50 dark:bg-neutral-900/50" : "bg-white dark:bg-neutral-900")}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", msg.is_read ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500" : "bg-purple-50 dark:bg-purple-500/10 text-purple-500")}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{msg.name}</h3>
                    <p className="text-caption text-neutral-500">{msg.email} • {msg.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-caption text-neutral-400 mr-2">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                  {!msg.is_read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(msg.id)} leftIcon={<Check size={14} />}>
                      Read
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleReply} leftIcon={<Reply size={14} />}>
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMessage(msg.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="ml-[3.25rem]">
                <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100 mb-1">Subject: {msg.subject}</p>
                <p className="text-body-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{msg.message}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  
  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'doctor').then(({ data }) => {
      if (data && data.length > 0) {
        setDoctors(data)
      }
    })

    supabase.from('branches').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setBranches(data)
      }
    })
  }, [])

  const currentNav = NAV_ITEMS.find(n => n.id === active)

  const ADMIN_SECTIONS: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboardHome doctors={doctors} />,
    messages: <MessagesSection />,
    doctors: <DoctorsManagementSection />,
    branches: <BranchesSection branches={branches} />,
    staff: <div className="p-8 text-neutral-500 text-center">Staff management section</div>,
    patients: <div className="p-8 text-neutral-500 text-center">Patient records section</div>,
    analytics: <DataBox />,
    revenue: <div className="p-8 text-neutral-500 text-center">Revenue analytics section</div>,
    permissions: <div className="p-8 text-neutral-500 text-center">Role & permissions management</div>,
    settings: (
      <div className="space-y-8">
        <SystemModule />
        <div className="p-8 text-neutral-500 text-center">System settings</div>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex">
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <AdminSidebar active={active} onNavigate={setActive} />
      </div>
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"><AdminSidebar active={active} onNavigate={setActive} onClose={() => setSidebarOpen(false)} /></div>
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark px-4 sm:px-6 h-14 flex items-center gap-4">
          <button className="lg:hidden p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <h2 className="font-manrope font-semibold text-neutral-900 dark:text-neutral-100">{currentNav?.label}</h2>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Link to="/" className="text-caption text-neutral-400 hover:text-accent-500 hidden sm:block">← Back to Site</Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {ADMIN_SECTIONS[active]}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
