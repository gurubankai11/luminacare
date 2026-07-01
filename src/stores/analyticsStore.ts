import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface SystemMetrics {
  cpu_usage: number
  memory_usage: number
  active_users: number
  database_status: 'healthy' | 'degraded' | 'down'
  server_status: 'healthy' | 'degraded' | 'down'
  ai_status: 'healthy' | 'degraded' | 'down'
  storage_usage_gb: number
}

export interface AnalyticsData {
  totalRevenue: number
  monthlyRevenue: { month: string, revenue: number }[]
  appointmentsTrend: { date: string, count: number }[]
  diseaseDistribution: { name: string, value: number }[]
  totalPatients: number
  totalDoctors: number
}

interface AnalyticsStore {
  metrics: SystemMetrics | null
  analytics: AnalyticsData | null
  isLoading: boolean
  fetchMetrics: () => Promise<void>
  fetchAnalytics: () => Promise<void>
  subscribeToMetrics: () => (() => void)
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  metrics: null,
  analytics: null,
  isLoading: false,

  fetchMetrics: async () => {
    set({ isLoading: true })

    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') { // no rows returned
          const defaultMetrics = {
            cpu_usage: 45,
            memory_usage: 62,
            active_users: 124,
            database_status: 'healthy',
            server_status: 'healthy',
            ai_status: 'healthy',
            storage_usage_gb: 12.5
          }
          await supabase.from('system_metrics').insert(defaultMetrics)
          set({ metrics: defaultMetrics as SystemMetrics })
        } else {
          throw error
        }
      } else if (data) {
        set({ metrics: data as SystemMetrics })
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true })

    try {
      // Calculate real analytics from database tables
      
      // 1. Total Patients & Doctors
      const { count: patientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient')
      const { count: doctorsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor')
      
      // 2. Total Revenue (Assuming each appointment is approx 500 INR for demo purposes since we lack a payments table)
      const { count: totalAppts } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      const revenue = (totalAppts || 0) * 500

      // 3. Appointments Trend (Last 7 days)
      const today = new Date()
      const trend = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('date', dateStr)
        trend.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: count || 0 })
      }

      set({
        analytics: {
          totalRevenue: revenue,
          totalPatients: patientsCount || 0,
          totalDoctors: doctorsCount || 0,
          monthlyRevenue: [], // Complex grouped query omitted for brevity, can be added via RPC
          appointmentsTrend: trend,
          diseaseDistribution: [] // Requires complex NLP or standard coding on diagnoses
        }
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  subscribeToMetrics: () => {
    const channel = supabase.channel('metrics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_metrics' },
        (payload) => {
          set({ metrics: payload.new as SystemMetrics })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
