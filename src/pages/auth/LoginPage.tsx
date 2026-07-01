import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Stethoscope, Settings, Phone, Zap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import { IS_DEV_MODE, DEV_ROLES } from '../../lib/devMode'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  fullName: z.string().min(2, 'Name is required').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

type LoginRole = 'patient' | 'doctor' | 'reception' | 'admin'
type AuthMode = 'login' | 'register' | 'forgot_password'

interface LoginPageProps {
  role: LoginRole
}

const ROLE_CONFIG = {
  patient: {
    icon: User,
    title: 'Patient Portal',
    subtitle: 'Sign in to manage your appointments, prescriptions, and health records.',
    color: 'blue',
    gradient: 'from-blue-50 to-accent-50 dark:from-blue-500/5 dark:to-accent-500/5',
    dashboardPath: '/dashboard/patient',
  },
  doctor: {
    icon: Stethoscope,
    title: 'Doctor Portal',
    subtitle: 'Access your patient queue, write prescriptions, and manage appointments.',
    color: 'emerald',
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5',
    dashboardPath: '/dashboard/doctor',
  },
  reception: {
    icon: Phone,
    title: 'Reception Portal',
    subtitle: 'Manage patient walk-ins, appointments, and token generation.',
    color: 'amber',
    gradient: 'from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5',
    dashboardPath: '/dashboard/reception',
  },
  admin: {
    icon: Settings,
    title: 'Admin Portal',
    subtitle: 'Oversee operations, staff, analytics, and system configuration.',
    color: 'purple',
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-500/5 dark:to-violet-500/5',
    dashboardPath: '/dashboard/admin',
  },
}

export default function LoginPage({ role }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signIn, signUp, resetPassword, isLoading, devSignIn, isAuthenticated, user } = useAuthStore()
  const config = ROLE_CONFIG[role]

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashPath = ROLE_CONFIG[user.role as LoginRole]?.dashboardPath || '/dashboard/patient'
      navigate(dashPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleDevLogin = (devRole: string) => {
    devSignIn(devRole)
    const dashPath = ROLE_CONFIG[devRole as LoginRole]?.dashboardPath || '/dashboard/patient'
    navigate(dashPath)
  }
  const Icon = config.icon

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', fullName: '' },
  })

  const onSubmit = async (data: FormData) => {
    setMessage(null)
    
    if (authMode === 'login') {
      if (!data.password) {
        setError('password', { message: 'Password is required' })
        return
      }
      const { error } = await signIn(data.email, data.password)
      if (error) {
        setError('password', { message: error })
        return
      }
      navigate(config.dashboardPath)
    } else if (authMode === 'register') {
      if (!data.password) {
        setError('password', { message: 'Password is required' })
        return
      }
      if (!data.fullName) {
        setError('fullName', { message: 'Full Name is required' })
        return
      }
      const { error } = await signUp(data.email, data.password, data.fullName, role)
      if (error) {
        setError('password', { message: error })
        return
      }
      setMessage('Registration successful! Check your email to verify your account.')
    } else if (authMode === 'forgot_password') {
      const { error } = await resetPassword(data.email)
      if (error) {
        setError('email', { message: error })
        return
      }
      setMessage('Password reset email sent! Please check your inbox.')
    }
  }

  const OTHER_ROLES = (['patient', 'doctor', 'reception', 'admin'] as LoginRole[])
    .filter(r => r !== role)

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex">
      {/* Left panel */}
      <div className={cn('hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br', config.gradient)}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center shadow-glow-accent-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-manrope font-bold text-lg text-neutral-900 dark:text-neutral-100">
            Lumina<span className="text-accent-500">Care</span>
          </span>
        </Link>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-md flex items-center justify-center mb-8">
              <Icon size={28} className="text-accent-500" />
            </div>
            <h1 className="font-manrope font-bold text-display-md text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
              {config.title}
            </h1>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              {config.subtitle}
            </p>
          </motion.div>

          {/* Switch portal links */}
          <div className="mt-12">
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mb-4">Switch Portal</p>
            <div className="flex flex-col gap-2">
              {OTHER_ROLES.map(r => {
                const OtherIcon = ROLE_CONFIG[r].icon
                return (
                  <Link
                    key={r}
                    to={`/login/${r}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 border border-white/40 dark:border-neutral-800 transition-all duration-200 group"
                  >
                    <OtherIcon size={15} className="text-neutral-400 group-hover:text-accent-500 transition-colors" />
                    <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-400 capitalize">{r} Login</span>
                    <ArrowRight size={13} className="ml-auto text-neutral-300 group-hover:text-accent-500 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <p className="text-caption text-neutral-400">
          © {new Date().getFullYear()} LuminaCare. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-manrope font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Lumina<span className="text-accent-500">Care</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">
              {authMode === 'login' && 'Sign In'}
              {authMode === 'register' && 'Create Account'}
              {authMode === 'forgot_password' && 'Reset Password'}
            </h2>
            <p className="text-body-md text-neutral-500 dark:text-neutral-400 mt-1.5">
              {authMode === 'login' && `${config.title} — enter your credentials below`}
              {authMode === 'register' && 'Fill out your details to get started'}
              {authMode === 'forgot_password' && 'Enter your email to receive a password reset link'}
            </p>
          </div>
          
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-body-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {authMode === 'register' && (
              <Input
                id="login-name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                leftIcon={<User size={16} />}
                required
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            )}

            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@luminacare.in"
              leftIcon={<Mail size={16} />}
              required
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            {authMode !== 'forgot_password' && (
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={authMode === 'login' ? 'Enter your password' : 'Create a secure password'}
                leftIcon={<Lock size={16} />}
                required
                error={errors.password?.message}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                {...register('password')}
              />
            )}

            {authMode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot_password'); setMessage(null); }}
                  className="text-body-sm text-accent-600 dark:text-accent-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              {authMode === 'login' && 'Sign In'}
              {authMode === 'register' && 'Sign Up'}
              {authMode === 'forgot_password' && 'Send Reset Link'}
            </Button>
            
            {(authMode === 'login' || authMode === 'register') && (
              <>
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
                  <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm">Or continue with</span>
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={async () => {
                    const { error } = await useAuthStore.getState().signInWithGoogle()
                    if (error) setMessage(error)
                  }}
                  leftIcon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                  }
                >
                  Google
                </Button>
              </>
            )}
          </form>

          {authMode === 'login' && (
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400 text-center mt-6">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setAuthMode('register'); setMessage(null); }} className="text-accent-600 dark:text-accent-400 font-medium hover:underline">
                Create one
              </button>
            </p>
          )}

          {(authMode === 'register' || authMode === 'forgot_password') && (
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400 text-center mt-6">
              Already have an account?{' '}
              <button type="button" onClick={() => { setAuthMode('login'); setMessage(null); }} className="text-accent-600 dark:text-accent-400 font-medium hover:underline">
                Sign in instead
              </button>
            </p>
          )}
          {/* Dev Mode Login Panel */}
          {IS_DEV_MODE && DEV_ROLES.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8 p-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-amber-500" />
                <span className="text-body-sm font-semibold text-amber-700 dark:text-amber-400">Development Mode</span>
              </div>
              <p className="text-caption text-amber-600/80 dark:text-amber-400/60 mb-3">Skip auth — instant login as any role:</p>
              <div className="grid grid-cols-2 gap-2">
                {DEV_ROLES.map(r => {
                  const DevIcon = ROLE_CONFIG[r as LoginRole]?.icon || User
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleDevLogin(r)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200',
                        'bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/30',
                        'hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10',
                        'text-neutral-700 dark:text-neutral-300 capitalize'
                      )}
                    >
                      <DevIcon size={14} className="text-amber-500" />
                      {r}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
