/**
 * Development Mode Configuration
 * ───────────────────────────────
 * When VITE_DEV_MODE=true, enables instant role-based login
 * without requiring real Supabase Auth. This module exports
 * dev user profiles that mirror the seed data UUIDs.
 *
 * When VITE_DEV_MODE=false (or unset), all exports are inert.
 * No bypass code remains active in production.
 */

export const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

export interface DevUser {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'admin' | 'reception'
  avatar_url: string | null
  specialty?: string
}

const DEV_USERS: Record<string, DevUser> = {
  patient: {
    id: '00000000-0000-4000-a000-000000000e01',
    name: 'Ananya Krishnan',
    email: 'ananya@example.com',
    role: 'patient',
    avatar_url: null,
  },
  doctor: {
    id: '00000000-0000-4000-a000-000000000d01',
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@luminacare.dev',
    role: 'doctor',
    avatar_url: null,
    specialty: 'General Physician',
  },
  reception: {
    id: '00000000-0000-4000-a000-000000000c01',
    name: 'Priya Reception',
    email: 'reception@luminacare.dev',
    role: 'reception',
    avatar_url: null,
  },
  admin: {
    id: '00000000-0000-4000-a000-000000000a01',
    name: 'System Admin',
    email: 'admin@luminacare.dev',
    role: 'admin',
    avatar_url: null,
  },
}

/** Returns a dev user profile for the given role. Returns null if dev mode is off. */
export function getDevUser(role: string): DevUser | null {
  if (!IS_DEV_MODE) return null
  return DEV_USERS[role] ?? null
}

/** All available dev roles for the login selector */
export const DEV_ROLES = IS_DEV_MODE
  ? (['patient', 'doctor', 'reception', 'admin'] as const)
  : ([] as const)
