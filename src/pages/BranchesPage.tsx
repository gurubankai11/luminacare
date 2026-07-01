import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'



export default function BranchesPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    supabase.from('branches').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setBranches(data)
      }
    })
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
            <Badge variant="accent" dot className="mb-6">Our Locations</Badge>
            <h1 className="font-manrope font-extrabold text-display-lg text-neutral-900 dark:text-neutral-100 mb-5">
              Always{' '}
              <span className="gradient-text">Near You</span>
            </h1>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              8 conveniently located branches across Maharashtra — bringing world-class healthcare to your neighbourhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Branch Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="h-full bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-lg transition-all duration-300">
                  {/* Map placeholder */}
                  <div className="h-44 bg-gradient-to-br from-accent-50 to-blue-100 dark:from-neutral-800 dark:to-neutral-800 relative overflow-hidden">
                    <iframe
                      title={`Map for ${branch.name}`}
                      src={`https://www.google.com/maps?q=${branch.name}&output=embed`}
                      className="w-full h-full opacity-80"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    {branch.is_emergency && (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-caption font-bold px-3 py-1 rounded-full">
                        24/7 Emergency
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100 mb-1">{branch.name}</h2>

                    <div className="space-y-2.5 mt-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={15} className="text-accent-500 mt-0.5 flex-shrink-0" />
                        <p className="text-body-sm text-neutral-600 dark:text-neutral-400">{branch.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={15} className="text-accent-500 flex-shrink-0" />
                        <p className="text-body-sm text-neutral-600 dark:text-neutral-400">{branch.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={15} className="text-accent-500 flex-shrink-0" />
                        <p className="text-body-sm text-neutral-600 dark:text-neutral-400">{branch.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={15} className="text-accent-500 flex-shrink-0" />
                        <p className="text-body-sm text-neutral-600 dark:text-neutral-400">
                          {branch.operating_hours}
                        </p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {branch.facilities?.map((s: string) => (
                        <span key={s} className="badge badge-accent text-xs">{s}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        leftIcon={<Navigation size={13} />}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${branch.name}`, '_blank')}
                      >
                        Directions
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => navigate('/book-appointment')}
                      >
                        Book Here
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
