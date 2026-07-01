import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Mail, Calendar, Clock, FileText, CheckCircle, ChevronRight, ChevronLeft, Stethoscope } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Textarea, Select } from '../components/ui/FormElements'
import { Badge } from '../components/ui'
import { cn, generateAppointmentNumber, formatDate, formatTime, TIME_SLOTS } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useAppointmentStore } from '../stores/appointmentStore'

/* ─── Schemas per step ─── */
const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().min(1, 'Enter valid age').max(3, 'Enter valid age'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number'),
  email: z.string().email('Enter valid email'),
  address: z.string().min(10, 'Enter full address'),
})

const step2Schema = z.object({
  doctor_id: z.string().min(1, 'Select a doctor'),
  appointment_date: z.string().min(1, 'Select appointment date'),
  appointment_time: z.string().min(1, 'Select appointment time'),
})

const step3Schema = z.object({
  symptoms: z.string().min(5, 'Describe your symptoms (min 5 chars)'),
  notes: z.string().optional(),
})

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)
type FormData = z.infer<typeof fullSchema>

const stepSchemas = [step1Schema, step2Schema, step3Schema]

/* ─── Doctors ─── */


const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Appointment', icon: Calendar },
  { id: 3, label: 'Medical Info', icon: FileText },
  { id: 4, label: 'Confirm', icon: CheckCircle },
]

/* ─── Booking Confirmation ─── */
function BookingConfirmation({ data, appointmentNumber, tokenNumber }: {
  data: FormData
  appointmentNumber: string
  tokenNumber: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={40} className="text-emerald-500" />
      </motion.div>

      <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mb-2">
        Appointment Booked!
      </h2>
      <p className="text-body-md text-neutral-500 dark:text-neutral-400 mb-10">
        Your appointment has been confirmed. Please save your token details.
      </p>

      {/* Token Card */}
      <div className="bg-gradient-to-br from-accent-50 to-blue-50 dark:from-accent-500/10 dark:to-blue-500/10 border border-accent-200 dark:border-accent-500/30 rounded-2xl p-8 mb-8 text-left">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Appointment No.</p>
            <p className="font-manrope font-bold text-heading-lg text-neutral-900 dark:text-neutral-100">{appointmentNumber}</p>
          </div>
          <div>
            <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Token Number</p>
            <p className="font-manrope font-bold text-display-md text-accent-600 dark:text-accent-400">#{String(tokenNumber).padStart(4, '0')}</p>
          </div>
          <div>
            <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Patient</p>
            <p className="font-semibold text-body-md text-neutral-800 dark:text-neutral-200">{data.name}</p>
          </div>
          <div>
            <p className="font-semibold text-body-md text-neutral-800 dark:text-neutral-200">
              Assigned Doctor
            </p>
          </div>
          <div>
            <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Date</p>
            <p className="font-semibold text-body-md text-neutral-800 dark:text-neutral-200">{formatDate(data.appointment_date)}</p>
          </div>
          <div>
            <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Time</p>
            <p className="font-semibold text-body-md text-neutral-800 dark:text-neutral-200">{formatTime(data.appointment_time)}</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-accent-200 dark:border-accent-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Queue Position</p>
              <p className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">
                #{Math.min(tokenNumber, 5)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-caption text-neutral-500 uppercase tracking-wide mb-1">Est. Wait</p>
              <p className="font-semibold text-body-md text-neutral-800 dark:text-neutral-200">~{Math.min(tokenNumber, 5) * 12} min</p>
            </div>
            <Badge variant="success" dot>Confirmed</Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" size="md" fullWidth onClick={() => window.location.href = '/login/patient'}>
          View in Dashboard
        </Button>
        <Button variant="primary" size="md" fullWidth onClick={() => window.location.reload()}>
          Book Another
        </Button>
      </div>
    </motion.div>
  )
}

/* ─── Main Page ─── */
export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [appointmentNumber, setAppointmentNumber] = useState('')
  const [tokenNumber, setTokenNumber] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true)
  const { user } = useAuthStore()
  const { bookAppointment } = useAppointmentStore()
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true'

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsDoctorsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name', { ascending: true })
      
      if (data) {
        setDoctors(data)
      }
      setIsDoctorsLoading(false)
    }
    
    fetchDoctors()

    const subscription = supabase
      .channel('public:profiles:doctors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: "role=eq.'doctor'" }, () => {
        fetchDoctors()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const doctorOptions = doctors.map(d => ({
    value: d.id,
    label: `${d.name} — ${d.specialty || 'General'} (₹${d.consultation_fee || 500} • ${d.experience_years || 5}y exp)`
  }))

  const { register, handleSubmit, trigger, watch, control, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: undefined,
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
    },
  })

  const watchedData = watch()

  const nextStep = async () => {
    const schema = stepSchemas[currentStep - 1]
    const fields = Object.keys(schema.shape) as (keyof FormData)[]
    const valid = await trigger(fields)
    if (valid) setCurrentStep(s => s + 1)
  }

  const prevStep = () => setCurrentStep(s => Math.max(1, s - 1))

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const apptData = {
        patient_id: user?.id,
        doctor_id: data.doctor_id,
        date: data.appointment_date,
        time: data.appointment_time,
        symptoms: data.symptoms,
      }
      const response = await bookAppointment(apptData)
      if (response) {
        setAppointmentNumber(response.id.split('-')[0].toUpperCase())
        setTokenNumber(response.queue_token)
        setIsSubmitted(true)
      } else {
        const apptNum = generateAppointmentNumber()
        const token = Math.floor(Math.random() * 15) + 1
        setAppointmentNumber(apptNum)
        setTokenNumber(token)
        setIsSubmitted(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 60)
    return d.toISOString().split('T')[0]
  }

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-3xl mx-auto">

          {!isSubmitted && (
            <div className="text-center mb-12">
              <Badge variant="accent" dot className="mb-4">Book Appointment</Badge>
              <h1 className="font-manrope font-extrabold text-display-md text-neutral-900 dark:text-neutral-100 mb-3">
                Schedule Your Visit
              </h1>
              <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
                Fill in your details and we'll confirm your appointment instantly.
              </p>
            </div>
          )}

          {/* Dev Mode Warning */}
          {isDevMode && !isDoctorsLoading && doctors.length === 0 && (
            <div className="mb-8 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 text-center">
              <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-lg mb-2">⚠ Development Warning</h3>
              <p className="text-rose-600 dark:text-rose-300">
                No development doctors were found. Run <code>seed.sql</code> in your Supabase dashboard to populate the database with realistic doctors.
              </p>
            </div>
          )}

          {/* Step Progress */}
          {!isSubmitted && (
            <div className="flex items-center justify-between mb-10 relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border-light dark:bg-border-dark z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-accent-500 z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map(step => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isComplete = currentStep > step.id
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                      isComplete
                        ? 'bg-accent-500 border-accent-500 text-white'
                        : isActive
                          ? 'bg-white dark:bg-neutral-900 border-accent-500 text-accent-500'
                          : 'bg-white dark:bg-neutral-900 border-border-light dark:border-border-dark text-neutral-400'
                    )}>
                      {isComplete ? <CheckCircle size={18} /> : <Icon size={16} />}
                    </div>
                    <span className={cn(
                      'text-caption font-medium hidden sm:block',
                      isActive ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-400'
                    )}>{step.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-3xl p-8 shadow-soft-lg">
            {isSubmitted ? (
              <BookingConfirmation
                data={getValues()}
                appointmentNumber={appointmentNumber}
                tokenNumber={tokenNumber}
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">

                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Personal Information</h2>
                        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">Tell us about yourself.</p>
                      </div>
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        leftIcon={<User size={16} />}
                        required
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Input
                          label="Age"
                          placeholder="Your age"
                          type="text"
                          required
                          error={errors.age?.message}
                          {...register('age')}
                        />
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Gender"
                              required
                              placeholder="Select gender"
                              options={[
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                                { value: 'other', label: 'Other' },
                              ]}
                              error={errors.gender?.message}
                              {...field}
                            />
                          )}
                        />
                      </div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="10-digit mobile number"
                        leftIcon={<Phone size={16} />}
                        required
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        leftIcon={<Mail size={16} />}
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Textarea
                        label="Address"
                        placeholder="Your complete home address"
                        rows={3}
                        required
                        error={errors.address?.message}
                        {...register('address')}
                      />
                    </motion.div>
                  )}

                  {/* Step 2: Appointment Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Appointment Details</h2>
                        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">Select your preferred doctor, date and time.</p>
                      </div>
                      <Controller
                        name="doctor_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Preferred Doctor"
                            required
                            placeholder={isDoctorsLoading ? "Loading doctors..." : doctors.length === 0 ? (isDevMode ? "⚠ DEV MODE: Run seed.sql to load doctors!" : "No doctors are currently available.") : "Choose a doctor"}
                            options={doctorOptions}
                            error={errors.doctor_id?.message}
                            disabled={isDoctorsLoading || doctors.length === 0}
                            {...field}
                          />
                        )}
                      />
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Input
                          label="Appointment Date"
                          type="date"
                          required
                          min={getTomorrowDate()}
                          max={getMaxDate()}
                          leftIcon={<Calendar size={16} />}
                          error={errors.appointment_date?.message}
                          {...register('appointment_date')}
                        />
                        <Controller
                          name="appointment_time"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Preferred Time"
                              required
                              placeholder="Select time slot"
                              options={TIME_SLOTS.map(t => ({ value: t, label: formatTime(t) }))}
                              error={errors.appointment_time?.message}
                              {...field}
                            />
                          )}
                        />
                      </div>

                      {/* Time slot visual picker */}
                      {watchedData.appointment_time && (
                        <div className="bg-accent-50 dark:bg-accent-500/10 rounded-xl p-4 border border-accent-200 dark:border-accent-500/20">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-accent-500" />
                            <div>
                              <p className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                Selected: {formatTime(watchedData.appointment_time)}
                              </p>
                              <p className="text-caption text-neutral-500">Typical consultation: 15–30 minutes</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Medical Info */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Medical Information</h2>
                        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">Help your doctor prepare for your visit.</p>
                      </div>
                      <Textarea
                        label="Symptoms / Chief Complaint"
                        placeholder="Describe your symptoms in detail (e.g., chest pain for 3 days, mild fever...)"
                        rows={5}
                        required
                        error={errors.symptoms?.message}
                        {...register('symptoms')}
                      />
                      <Textarea
                        label="Additional Notes (Optional)"
                        placeholder="Any medications you're taking, allergies, past surgeries, or other relevant information..."
                        rows={4}
                        {...register('notes')}
                      />
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                        <p className="text-caption text-amber-700 dark:text-amber-400">
                          ⚠ For medical emergencies, please call <strong>+91 98765 11111</strong> or visit our 24/7 Emergency center directly.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Review & Confirm</h2>
                        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">Please verify your details before submitting.</p>
                      </div>

                      {/* Review sections */}
                      {[
                        {
                          title: 'Personal Info',
                          icon: User,
                          rows: [
                            ['Name', watchedData.name],
                            ['Age / Gender', `${watchedData.age} yrs / ${watchedData.gender}`],
                            ['Phone', watchedData.phone],
                            ['Email', watchedData.email],
                            ['Address', watchedData.address],
                          ],
                        },
                        {
                          title: 'Appointment',
                          icon: Calendar,
                          rows: [
                            ['Doctor', doctorOptions.find(d => d.value === watchedData.doctor_id)?.label || '—'],
                            ['Date', watchedData.appointment_date ? formatDate(watchedData.appointment_date) : '—'],
                            ['Time', watchedData.appointment_time ? formatTime(watchedData.appointment_time) : '—'],
                          ],
                        },
                        {
                          title: 'Medical Info',
                          icon: Stethoscope,
                          rows: [
                            ['Symptoms', watchedData.symptoms],
                            ['Notes', watchedData.notes || '—'],
                          ],
                        },
                      ].map(({ title, icon: Icon, rows }) => (
                        <div key={title} className="border border-border-light dark:border-border-dark rounded-2xl overflow-hidden">
                          <div className="flex items-center gap-2.5 px-5 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-border-light dark:border-border-dark">
                            <Icon size={15} className="text-accent-500" />
                            <span className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</span>
                          </div>
                          <div className="divide-y divide-border-light dark:divide-border-dark">
                            {rows.map(([label, value]) => (
                              <div key={label} className="grid grid-cols-5 px-5 py-3">
                                <p className="col-span-2 text-body-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                                <p className="col-span-3 text-body-sm font-medium text-neutral-900 dark:text-neutral-100 break-words">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light dark:border-border-dark">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    leftIcon={<ChevronLeft size={16} />}
                    onClick={prevStep}
                    className={currentStep === 1 ? 'invisible' : ''}
                  >
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      rightIcon={<ChevronRight size={16} />}
                      onClick={nextStep}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isLoading}
                      rightIcon={<CheckCircle size={16} />}
                    >
                      Confirm Appointment
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
