import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormData) => {
    setMessage(null)
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })
      
      if (error) {
        setError('password', { message: error.message })
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login/patient', { replace: true })
        }, 2000)
      }
    } catch {
      setError('password', { message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-soft-xl p-8 border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-accent-500" />
          </div>
          <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">
            Reset Password
          </h2>
          <p className="text-body-md text-neutral-500 dark:text-neutral-400 mt-2">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-body-sm font-medium text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="new-password"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a secure password"
            leftIcon={<Lock size={16} />}
            required
            error={errors.password?.message}
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

          <Input
            id="confirm-password"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            leftIcon={<Lock size={16} />}
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight size={16} />}
            className="mt-2"
          >
            Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
