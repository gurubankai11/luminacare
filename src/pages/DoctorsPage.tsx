import { motion } from 'framer-motion'
import { Star, Clock, Calendar, Stethoscope, Award } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'



export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true'

  useEffect(() => { 
    const fetchDocs = async () => {
      setIsLoading(true)
      const { data } = await supabase.from('profiles').select('*').eq('role', 'doctor').is('deleted_at', null);
      if (data && data.length > 0) {
        setDoctors(data)
      }
      setIsLoading(false)
    }
    fetchDocs()
  }, [])
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
            <Badge variant="accent" dot className="mb-6">Our Team</Badge>
            <h1 className="font-manrope font-extrabold text-display-lg text-neutral-900 dark:text-neutral-100 mb-5">
              Expert Doctors,{' '}
              <span className="gradient-text">Exceptional Care</span>
            </h1>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Our team of 40+ specialists brings decades of expertise, compassion, and commitment to every patient interaction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {isDevMode && !isLoading && doctors.length === 0 && (
            <div className="mb-12 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
              <h3 className="font-bold text-rose-700 dark:text-rose-400 text-xl mb-3">⚠ Development Mode Warning</h3>
              <p className="text-rose-600 dark:text-rose-300 text-lg">
                No development doctors were found in the database.
                <br /><br />
                Please run <code>seed.sql</code> in your Supabase dashboard to populate the database with realistic doctors, or ensure your <code>VITE_SUPABASE_URL</code> is correctly set in <code>.env.local</code>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="h-full bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-xl hover:border-accent-200 dark:hover:border-accent-600/30 transition-all duration-300">
                  {/* Header */}
                  <div className="relative h-44 bg-gradient-to-br from-accent-50 to-blue-100 dark:from-accent-500/10 dark:to-blue-500/10 flex items-center justify-center">
                    {/* Avatar */}
                    {doc.avatar_url ? (
                      <img src={doc.avatar_url} alt={doc.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 shadow-soft-md object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-soft-md flex items-center justify-center">
                        <Stethoscope size={36} className="text-accent-500" />
                      </div>
                    )}

                    {/* Rating */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft-sm">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-body-sm font-bold text-neutral-800 dark:text-neutral-200">4.9</span>
                      <span className="text-caption text-neutral-400">(300)</span>
                    </div>

                    {/* Experience badge */}
                    <div className="absolute bottom-4 left-4 bg-accent-500 text-white text-caption font-semibold px-3 py-1 rounded-full">
                      10+ years
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">{doc.name}</h2>
                    <p className="text-body-sm text-accent-600 dark:text-accent-400 font-semibold mt-0.5">Specialist</p>
                    <p className="text-caption text-neutral-400 dark:text-neutral-500 mt-1">MD</p>

                    <p className="text-body-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-3 line-clamp-2">Our specialist providing top tier medical care.</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {['Healthcare', 'Clinic'].map(tag => (
                        <span key={tag} className="badge badge-accent text-xs">{tag}</span>
                      ))}
                    </div>

                    {/* Availability */}
                    <div className="mt-5 pt-4 border-t border-border-light dark:border-border-dark grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-accent-500 flex-shrink-0" />
                        <span className="text-caption text-neutral-600 dark:text-neutral-400">Mon–Sat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-accent-500 flex-shrink-0" />
                        <span className="text-caption text-neutral-600 dark:text-neutral-400">10:00 AM – 4:00 PM</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="mt-5"
                      onClick={() => window.location.href = '/book-appointment'}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-cream-200 dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto text-center">
          <Award size={32} className="text-accent-500 mx-auto mb-4" />
          <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mb-3">
            Can't find your specialist?
          </h2>
          <p className="text-body-md text-neutral-500 dark:text-neutral-400 mb-6">
            Call us and we'll connect you with the right doctor for your needs.
          </p>
          <Button variant="outline" size="lg">
            Call +91 98765 43210
          </Button>
        </div>
      </section>
    </PageWrapper>
  )
}
