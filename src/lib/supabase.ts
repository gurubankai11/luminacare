import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          role: 'patient' | 'doctor' | 'reception' | 'admin'
          avatar_url: string | null
          blood_group: string | null
          height: number | null
          weight: number | null
          allergies: string[] | null
          medical_history: string | null
          insurance_provider: string | null
          insurance_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: 'male' | 'female' | 'other' | null
          age: number | null
          address: string | null
          theme: 'light' | 'dark' | 'system'
          language: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'theme' | 'language'> & { theme?: 'light' | 'dark' | 'system', language?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          appointment_number: string
          queue_token: number
          patient_id: string
          doctor_id: string
          branch_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          symptoms: string | null
          notes: string | null
          queue_position: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      doctors: {
        Row: {
          id: string
          profile_id: string
          specialization: string
          qualification: string
          experience_years: number
          bio: string | null
          avatar_url: string | null
          branch_id: string
          available_days: string[]
          available_times: string[]
          consultation_fee: number
          is_active: boolean
          created_at: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          is_active: boolean
          created_at: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          phone: string
          email: string | null
          opening_time: string
          closing_time: string
          working_days: string[]
          map_url: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          appointment_id: string
          doctor_id: string
          patient_id: string
          diagnosis: string | null
          instructions: string | null
          created_at: string
        }
      }
      prescription_medicines: {
        Row: {
          id: string
          prescription_id: string
          medicine_name: string
          dosage: string
          morning: boolean
          afternoon: boolean
          night: boolean
          duration_days: number
          special_instructions: string | null
        }
      }
      test_reports: {
        Row: {
          id: string
          patient_id: string
          appointment_id: string | null
          test_type: 'blood_test' | 'xray' | 'mri' | 'ct_scan' | 'ultrasound' | 'ecg' | 'other'
          report_name: string
          file_url: string
          uploaded_by: string
          created_at: string
        }
      }
      queue: {
        Row: {
          id: string
          appointment_id: string
          doctor_id: string
          branch_id: string
          queue_date: string
          position: number
          status: 'waiting' | 'in_progress' | 'completed' | 'skipped'
          estimated_wait_minutes: number | null
          called_at: string | null
          completed_at: string | null
          created_at: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          message: string | null
          attachment_url: string | null
          attachment_type: 'image' | 'pdf' | 'report' | null
          is_read: boolean
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'appointment_reminder' | 'medicine_reminder' | 'chat' | 'test_reminder' | 'general'
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
      }
      system_metrics: {
        Row: {
          id: string
          cpu_usage: number
          memory_usage: number
          active_users: number
          database_status: 'healthy' | 'degraded' | 'down'
          server_status: 'healthy' | 'degraded' | 'down'
          ai_status: 'healthy' | 'degraded' | 'down'
          storage_usage_gb: number
          recorded_at: string
        }
      }
      analytics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          category: string
          date: string
          created_at: string
        }
      }
    }
  }
}
