import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Textarea } from '../components/ui/FormElements'
import { supabase } from '../lib/supabase'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type FormData = z.infer<typeof schema>

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 98765 43210',
    sub: 'Mon – Sat, 9 AM – 8 PM',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'care@luminacare.in',
    sub: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    label: 'Main Branch',
    value: '42, Bandra West, Mumbai',
    sub: 'Maharashtra 400050',
  },
  {
    icon: Clock,
    label: 'Emergency',
    value: '24 / 7 Open',
    sub: 'Emergency line: +91 98765 11111',
  },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.from('contact_messages').insert([data])
      if (error) throw error
      
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'New Contact Message',
          message: `From: ${data.name} (${data.email})\nSubject: ${data.subject}`,
          type: 'general',
          read: false
        }))
        await supabase.from('notifications').insert(notifications)
      }

      setSubmitted(true)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" dot className="mb-6">Get in Touch</Badge>
            <h1 className="font-manrope font-extrabold text-display-lg text-neutral-900 dark:text-neutral-100 mb-4">
              We're Here to{' '}
              <span className="gradient-text">Help</span>
            </h1>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Have a question, concern, or feedback? Our team is always ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100 mb-2">
                  Contact Information
                </h2>
                <p className="text-body-md text-neutral-500 dark:text-neutral-400 mb-8">
                  Reach out through any of these channels. Our support team is available Monday through Saturday.
                </p>

                <div className="space-y-5">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl shadow-soft-xs">
                      <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-accent-500" />
                      </div>
                      <div>
                        <p className="text-caption text-neutral-400 uppercase tracking-wide font-medium">{label}</p>
                        <p className="text-body-md font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">{value}</p>
                        <p className="text-caption text-neutral-500 dark:text-neutral-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl p-8 shadow-soft-md">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
                      <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-body-md text-neutral-500 dark:text-neutral-400">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100 mb-6">
                      Send us a Message
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Input
                          label="Full Name"
                          placeholder="Your full name"
                          required
                          error={errors.name?.message}
                          {...register('name')}
                        />
                        <Input
                          label="Phone Number"
                          placeholder="10-digit mobile"
                          required
                          error={errors.phone?.message}
                          {...register('phone')}
                        />
                      </div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input
                        label="Subject"
                        placeholder="How can we help you?"
                        required
                        error={errors.subject?.message}
                        {...register('subject')}
                      />
                      <Textarea
                        label="Message"
                        placeholder="Write your message here..."
                        rows={5}
                        required
                        error={errors.message?.message}
                        {...register('message')}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        rightIcon={<Send size={16} />}
                      >
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-soft-lg h-72 lg:h-96">
            <iframe
              title="LuminaCare Main Branch Location"
              src="https://www.google.com/maps?q=Bandra+West+Mumbai&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
