import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Search, Edit2, Trash2, X, Check, XCircle } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../../lib/supabase'
import { Avatar, Badge } from '../../../components/ui'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Select, Textarea } from '../../../components/ui/FormElements'
import toast from 'react-hot-toast'

const doctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  specialty: z.string().min(2, 'Specialty is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience_years: z.preprocess((v) => Number(v), z.number().min(0)),
  consultation_fee: z.preprocess((v) => Number(v), z.number().min(0)),
  branch_id: z.string().min(1, 'Branch is required'),
  bio: z.string().optional(),
})

type DoctorFormData = z.infer<typeof doctorSchema>

export default function DoctorsManagementSection() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(doctorSchema),
  })

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (data) setDoctors(data)
  }

  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('id, name').is('deleted_at', null)
    if (data) setBranches(data)
  }

  useEffect(() => {
    fetchDoctors()
    fetchBranches()

    const sub = supabase
      .channel('admin:doctors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: "role=eq.'doctor'" }, () => {
        fetchDoctors()
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  )

  const openAddModal = () => {
    setEditingDoctor(null)
    reset({
      name: '', email: '', phone: '', specialty: '', qualification: '',
      experience_years: 0, consultation_fee: 0, branch_id: '', bio: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor)
    reset({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialty: doctor.specialty || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || 0,
      consultation_fee: doctor.consultation_fee || 0,
      branch_id: doctor.branch_id || '',
      bio: doctor.bio || '',
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingDoctor) {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', editingDoctor.id)
        if (error) throw error
        toast.success('Doctor updated successfully')
      } else {
        // Since auth profiles require auth user, adding a user manually requires edge functions or auth API.
        // For development Admin CRUD without edge functions, we'll use a direct insert to profiles.
        // NOTE: In production, the user should be created in auth.users first, or via an edge function.
        // For this frontend flow, we will insert directly into profiles, assuming RLS allows admin insertions.
        const fakeId = '00000000-0000-4000-a000-' + Math.random().toString(16).substring(2, 14)
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: fakeId, // Fake UUID for dev mode
            role: 'doctor',
            is_active: true,
            ...data
          })
        if (error) throw error
        toast.success('Doctor created successfully')
      }
      setIsModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStatus = async (doctor: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !doctor.is_active })
        .eq('id', doctor.id)
      if (error) throw error
      toast.success(`Doctor ${doctor.is_active ? 'deactivated' : 'activated'}`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast.success('Doctor removed')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Doctors Management</h1>
        <Button variant="primary" size="sm" leftIcon={<UserPlus size={16} />} onClick={openAddModal}>
          Add Doctor
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-border-light dark:border-border-dark p-4 flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-body-sm focus:ring-2 focus:ring-accent-500 transition-shadow outline-none dark:text-neutral-200"
          />
        </div>
        <p className="text-caption text-neutral-500 font-medium ml-auto">
          Showing {filteredDoctors.length} doctors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDoctors.map(doc => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="flex flex-col h-full relative group">
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(doc)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:text-accent-600 transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:text-rose-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar name={doc.name || ''} src={doc.avatar_url} size="lg" status={doc.is_active ? 'online' : 'offline'} />
                  <div className="flex-1 min-w-0 pr-12">
                    <h3 className="font-bold text-body-lg text-neutral-900 dark:text-neutral-100 truncate">{doc.name}</h3>
                    <p className="text-caption text-neutral-500">{doc.specialty}</p>
                    <Badge variant={doc.is_active ? 'success' : 'neutral'} dot className="mt-2">
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                  <div>
                    <p className="text-caption text-neutral-500 uppercase tracking-wide">Experience</p>
                    <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-200">{doc.experience_years} years</p>
                  </div>
                  <div>
                    <p className="text-caption text-neutral-500 uppercase tracking-wide">Consult Fee</p>
                    <p className="font-medium text-body-sm text-neutral-900 dark:text-neutral-200">₹{doc.consultation_fee}</p>
                  </div>
                  <div className="col-span-2 mt-2">
                    <Button 
                      variant={doc.is_active ? 'outline' : 'primary'} 
                      size="sm" 
                      fullWidth 
                      onClick={() => toggleStatus(doc)}
                      leftIcon={doc.is_active ? <XCircle size={14} /> : <Check size={14} />}
                    >
                      {doc.is_active ? 'Deactivate Doctor' : 'Activate Doctor'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10">
              <h2 className="font-bold text-heading-md text-neutral-900 dark:text-neutral-100">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="doctor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Full Name" placeholder="Dr. John Doe" error={errors.name?.message as string} {...register('name')} />
                  <Input label="Email" type="email" placeholder="doctor@clinic.com" error={errors.email?.message as string} {...register('email')} />
                  <Input label="Phone" placeholder="10-digit number" error={errors.phone?.message as string} {...register('phone')} />
                  <Input label="Specialty" placeholder="e.g. Cardiologist" error={errors.specialty?.message as string} {...register('specialty')} />
                  <Input label="Qualification" placeholder="e.g. MBBS, MD" error={errors.qualification?.message as string} {...register('qualification')} />
                  <Controller
                    name="branch_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Branch"
                        placeholder="Select branch"
                        options={branches.map(b => ({ value: b.id, label: b.name }))}
                        error={errors.branch_id?.message as string}
                        {...field}
                      />
                    )}
                  />
                  <Input label="Experience (Years)" type="number" min="0" error={errors.experience_years?.message as string} {...register('experience_years')} />
                  <Input label="Consultation Fee (₹)" type="number" min="0" error={errors.consultation_fee?.message as string} {...register('consultation_fee')} />
                </div>
                <Textarea label="Bio / Description" placeholder="Short biography about the doctor..." rows={3} error={errors.bio?.message as string} {...register('bio')} />
              </form>
            </div>

            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-800/50 flex justify-end gap-3 sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" form="doctor-form" variant="primary" isLoading={isSubmitting}>
                {editingDoctor ? 'Save Changes' : 'Add Doctor'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
