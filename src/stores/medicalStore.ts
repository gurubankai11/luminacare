import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export interface Prescription {
  id: string
  appointment_id: string | null
  patient_id: string
  doctor_id: string
  diagnosis: string | null
  medicines: any[]
  instructions: string | null
  created_at: string
  deleted_at?: string | null
  // Joined
  patient?: { name: string }
  doctor?: { name: string; specialty: string | null }
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string | null
  appointment_id: string | null
  name: string
  report_type: string | null
  file_url: string | null
  status: 'normal' | 'review' | 'critical'
  uploaded_by: string | null
  created_at: string
  deleted_at?: string | null
}

interface MedicalStore {
  prescriptions: Prescription[]
  records: MedicalRecord[]
  isLoading: boolean
  error: string | null
  fetchPrescriptions: () => Promise<void>
  fetchRecords: () => Promise<void>
  addPrescription: (data: {
    patient_id: string
    appointment_id?: string
    diagnosis?: string
    medicines: any[]
    instructions?: string
  }) => Promise<void>
  addReport: (data: {
    patient_id: string
    doctor_id?: string
    appointment_id?: string
    name: string
    report_type: string
    file_url?: string
    status?: string
  }) => Promise<void>
  subscribeToPrescriptions: () => (() => void)
}

export const useMedicalStore = create<MedicalStore>((set, get) => ({
  prescriptions: [],
  records: [],
  isLoading: false,
  error: null,

  fetchPrescriptions: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      const isDoctor = user.role === 'doctor'
      const isAdmin = user.role === 'admin'
      const column = isDoctor ? 'doctor_id' : 'patient_id'

      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          patient:profiles!prescriptions_patient_id_fkey(name),
          doctor:profiles!prescriptions_doctor_id_fkey(name, specialty)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (!isAdmin) {
        query = query.eq(column, user.id)
      }

      const { data, error } = await query
      if (error) throw error
      set({ prescriptions: (data ?? []) as Prescription[] })
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error)
      set({ error: error.message || 'Failed to fetch prescriptions' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRecords: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (user.role === 'patient') {
        query = query.eq('patient_id', user.id)
      } else if (user.role === 'doctor') {
        query = query.eq('doctor_id', user.id)
      }
      // admin sees all

      const { data, error } = await query
      if (error) throw error
      set({ records: (data ?? []) as MedicalRecord[] })
    } catch (error: any) {
      console.error('Error fetching records:', error)
      set({ error: error.message || 'Failed to fetch records' })
    } finally {
      set({ isLoading: false })
    }
  },

  addPrescription: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const { error } = await supabase.from('prescriptions').insert([{
        doctor_id: user.id,
        patient_id: data.patient_id,
        appointment_id: data.appointment_id || null,
        diagnosis: data.diagnosis || null,
        medicines: data.medicines,
        instructions: data.instructions || null,
      }])
      if (error) throw error

      // Notify the patient
      await supabase.from('notifications').insert({
        user_id: data.patient_id,
        title: 'New Prescription',
        message: `${user.name || 'Your doctor'} has created a new prescription for you.${data.diagnosis ? ` Diagnosis: ${data.diagnosis}` : ''}`,
        type: 'prescription',
        read: false,
      })

      await get().fetchPrescriptions()
    } catch (error: any) {
      console.error('Error adding prescription:', error)
      throw error
    }
  },

  addReport: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const { error } = await supabase.from('reports').insert([{
        patient_id: data.patient_id,
        doctor_id: data.doctor_id || null,
        appointment_id: data.appointment_id || null,
        name: data.name,
        report_type: data.report_type,
        file_url: data.file_url || null,
        status: data.status || 'normal',
        uploaded_by: user.id,
      }])
      if (error) throw error

      // Notify the patient
      await supabase.from('notifications').insert({
        user_id: data.patient_id,
        title: 'Report Available',
        message: `Your ${data.name} report is now available for review.`,
        type: 'report',
        read: false,
      })

      await get().fetchRecords()
    } catch (error: any) {
      console.error('Error adding report:', error)
      throw error
    }
  },

  subscribeToPrescriptions: () => {
    const user = useAuthStore.getState().user
    if (!user) return () => {}

    const channel = supabase.channel(`prescriptions_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prescriptions' },
        () => { get().fetchPrescriptions() }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        () => { get().fetchRecords() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
