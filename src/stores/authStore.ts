import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { IS_DEV_MODE, getDevUser } from '../lib/devMode'

type UserRole = 'patient' | 'doctor' | 'reception' | 'admin'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  blood_group?: string | null
  height?: string | null
  weight?: string | null
  allergies?: string[] | null
  medical_history?: string | null
  insurance?: { provider: string; id: string } | null
  emergency_contact?: { name: string; phone: string } | null
  gender?: 'male' | 'female' | 'other' | null
  age?: number | null
  dob?: string | null
  address?: string | null
  city?: string | null
  // Doctor-specific
  specialty?: string | null
  qualification?: string | null
  experience_years?: number | null
  consultation_fee?: number | null
  bio?: string | null
  branch_id?: string | null
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isDevMode: boolean
  isSignOutModalOpen: boolean
  openSignOutModal: () => void
  closeSignOutModal: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
  devSignIn: (role: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isDevMode: IS_DEV_MODE,
      isSignOutModalOpen: false,

      openSignOutModal: () => set({ isSignOutModalOpen: true }),
      closeSignOutModal: () => set({ isSignOutModalOpen: false }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      devSignIn: (role: string) => {
        if (!IS_DEV_MODE) return
        const devUser = getDevUser(role)
        if (!devUser) return

        set({
          user: {
            id: devUser.id,
            email: devUser.email,
            name: devUser.name,
            phone: null,
            role: devUser.role,
            avatar_url: devUser.avatar_url,
            specialty: devUser.specialty ?? null,
          },
          isAuthenticated: true,
          isLoading: false,
        })
      },

      signIn: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            if (profile) {
              set({ user: profile as User, isAuthenticated: true, isLoading: false })
            } else {
              set({
                user: {
                  id: data.user.id, email, name: null, phone: null,
                  role: 'patient', avatar_url: null,
                },
                isAuthenticated: true, isLoading: false,
              })
            }
          }
          return { error: null }
        } catch {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred. Please try again.' }
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + import.meta.env.BASE_URL + 'dashboard/patient' },
          })
          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }
          return { error: null }
        } catch {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred. Please try again.' }
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + import.meta.env.BASE_URL + 'update-password',
          })
          set({ isLoading: false })
          return { error: error ? error.message : null }
        } catch {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred. Please try again.' }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
      },

      /**
       * Signup always assigns role='patient' regardless of what the UI sends.
       * The trigger in v6_schema.sql also enforces this server-side.
       */
      signUp: async (email, password, fullName, _role) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          })
          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }
          // The handle_new_user trigger creates the profile with role='patient'.
          // We do NOT manually insert here to avoid conflicts.
          if (data.user && data.session) {
            // Auto-confirmed (no email verification) — fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            if (profile) {
              set({ user: profile as User, isAuthenticated: true, isLoading: false })
            }
          }
          set({ isLoading: false })
          return { error: null }
        } catch {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred. Please try again.' }
        }
      },

      refreshUser: async () => {
        set({ isLoading: true })
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          if (IS_DEV_MODE) {
            set({ isLoading: false })
            return
          }
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          set({ user: profile as User, isAuthenticated: true, isLoading: false })
        } else {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || null,
              phone: null,
              role: 'patient',
              avatar_url: session.user.user_metadata?.avatar_url || null,
            },
            isAuthenticated: true,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'lumina-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
