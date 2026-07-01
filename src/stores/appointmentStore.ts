import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import { generateAppointmentNumber } from '../lib/utils'

export interface Appointment {
  id: string
  appointment_number: string
  patient_id: string
  doctor_id: string
  branch_id?: string | null
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress'
  queue_token: number
  symptoms: string
  notes?: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
  // Joined data
  patient?: { name: string; avatar_url: string | null; phone: string | null }
  doctor?: { name: string; avatar_url: string | null; specialty: string | null }
}

interface AppointmentStore {
  appointments: Appointment[]
  todayQueue: Appointment[]
  isLoading: boolean
  error: string | null
  fetchAppointments: () => Promise<void>
  fetchTodayQueue: () => Promise<void>
  updateStatus: (id: string, status: Appointment['status']) => Promise<void>
  bookAppointment: (data: {
    patient_id?: string
    doctor_id: string
    date: string
    time: string
    symptoms: string
    branch_id?: string
  }) => Promise<Appointment | null>
  subscribeToQueue: () => (() => void)
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  todayQueue: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(name, avatar_url, phone),
          doctor:profiles!appointments_doctor_id_fkey(name, avatar_url, specialty)
        `)
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .order('time', { ascending: true })

      // Scope by role
      if (user.role === 'patient') {
        query = query.eq('patient_id', user.id)
      } else if (user.role === 'doctor') {
        query = query.eq('doctor_id', user.id)
      }
      // admin/reception see all

      const { data, error } = await query
      if (error) throw error
      set({ appointments: (data ?? []) as Appointment[] })
    } catch (error: any) {
      console.error('Error fetching appointments:', error)
      set({ error: error.message || 'Failed to fetch appointments' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTodayQueue: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true, error: null })
    try {
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(name, avatar_url, phone),
          doctor:profiles!appointments_doctor_id_fkey(name, avatar_url, specialty)
        `)
        .eq('date', today)
        .is('deleted_at', null)
        .order('queue_token', { ascending: true })

      if (user.role === 'doctor') {
        query = query.eq('doctor_id', user.id)
      } else if (user.role === 'patient') {
        query = query.eq('patient_id', user.id)
      }
      // admin/reception see all for today

      const { data, error } = await query
      if (error) throw error
      set({ todayQueue: (data ?? []) as Appointment[] })
    } catch (error: any) {
      console.error('Error fetching today queue:', error)
      set({ error: error.message || 'Failed to fetch queue' })
    } finally {
      set({ isLoading: false })
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
      if (error) throw error

      // Optimistic update
      set(state => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a),
        todayQueue: state.todayQueue.map(a => a.id === id ? { ...a, status } : a)
      }))
    } catch (error: any) {
      console.error('Error updating status:', error)
      set({ error: error.message || 'Failed to update status' })
    }
  },

  bookAppointment: async (data) => {
    const user = useAuthStore.getState().user
    if (!user) return null

    const targetPatientId = data.patient_id || user.id

    try {
      // Calculate next queue token for this doctor on this date
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', data.doctor_id)
        .eq('date', data.date)
        .is('deleted_at', null)

      const queueToken = (count ?? 0) + 1
      const appointmentNumber = generateAppointmentNumber()

      const { data: newAppointment, error } = await supabase
        .from('appointments')
        .insert([{
          appointment_number: appointmentNumber,
          patient_id: targetPatientId,
          doctor_id: data.doctor_id,
          branch_id: data.branch_id || null,
          date: data.date,
          time: data.time,
          symptoms: data.symptoms,
          status: 'pending',
          queue_token: queueToken,
        }])
        .select()
        .single()

      if (error) throw error

      // Create notification for the doctor
      await supabase.from('notifications').insert({
        user_id: data.doctor_id,
        title: 'New Appointment',
        message: `New appointment from ${user.name || 'a patient'} on ${data.date} at ${data.time}. Symptoms: ${data.symptoms}`,
        type: 'appointment',
        read: false,
      })

      // Create notification for the patient
      await supabase.from('notifications').insert({
        user_id: targetPatientId,
        title: 'Appointment Booked',
        message: `Your appointment has been booked for ${data.date} at ${data.time}. Token: #${queueToken}`,
        type: 'appointment',
        read: false,
      })

      await get().fetchAppointments()
      return newAppointment as Appointment
    } catch (error: any) {
      console.error('Error booking appointment:', error)
      throw error
    }
  },

  subscribeToQueue: () => {
    const user = useAuthStore.getState().user
    if (!user) return () => {}

    const channelName = `appointments_${user.id}_${Date.now()}`
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          // Refresh data on any appointment change
          get().fetchTodayQueue()
          get().fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
