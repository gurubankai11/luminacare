import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

// Shared
import Loader from './components/shared/Loader'
import SignOutModal from './components/shared/SignOutModal'

// Public pages (Lazy loaded for better code splitting)
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'))
const BranchesPage = lazy(() => import('./pages/BranchesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BookAppointmentPage = lazy(() => import('./pages/BookAppointmentPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PrivacyPage = lazy(() => import('./pages/LegalPages').then(module => ({ default: module.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/LegalPages').then(module => ({ default: module.TermsPage })))

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const UpdatePasswordPage = lazy(() => import('./pages/auth/UpdatePasswordPage'))

// Dashboards
import { DashboardSkeleton } from './components/shared/Skeletons'

const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'))
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'))
const ReceptionDashboard = lazy(() => import('./pages/reception/ReceptionDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

import { useAuthStore } from './stores/authStore'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) return <Loader onComplete={() => {}} />

  if (!isAuthenticated) {
    return <Navigate to="/login/patient" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const validRoles = ['patient', 'doctor', 'reception', 'admin']
    if (validRoles.includes(user.role)) {
      return <Navigate to={`/dashboard/${user.role}`} replace />
    }
    return <Navigate to="/" replace />
  }

  return <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
}

/* ─── Animated Routes ─── */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
        <Suspense fallback={<Loader onComplete={() => {}} />}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Auth */}
            <Route path="/login/patient" element={<LoginPage role="patient" />} />
            <Route path="/login/doctor" element={<LoginPage role="doctor" />} />
            <Route path="/login/reception" element={<LoginPage role="reception" />} />
            <Route path="/login/admin" element={<LoginPage role="admin" />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />

            {/* Dashboards */}
            <Route path="/dashboard/patient/*" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/doctor/*" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/reception/*" element={<ProtectedRoute allowedRoles={['reception', 'admin']}><ReceptionDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
    </AnimatePresence>
  )
}

/* ─── App Root ─── */
function AppContent() {
  const [loading, setLoading] = useState(true)
  const { refreshUser } = useAuthStore()

  useEffect(() => {
    refreshUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      refreshUser()
    })
    return () => subscription.unsubscribe()
  }, [refreshUser])

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      {!loading && <AnimatedRoutes />}
      <SignOutModal />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--card)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  )
}
