import { motion } from 'framer-motion'
import { Heart, Eye, Target, Users, Award, Clock } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'

const TIMELINE = [
  { year: '2012', title: 'Founded', desc: 'LuminaCare was established with a single clinic and a vision for patient-first care.' },
  { year: '2015', title: 'Expanded', desc: 'Opened 3 new branches across the city, serving 5,000+ patients.' },
  { year: '2018', title: 'Digital First', desc: 'Launched our digital platform with online appointments and electronic records.' },
  { year: '2021', title: 'Specialized Care', desc: 'Added cardiology, orthopedics, and neurology departments.' },
  { year: '2024', title: 'Platform Launch', desc: 'Launched LuminaCare App with live queue, prescriptions, and telemedicine.' },
  { year: '2026', title: 'Now', desc: '8 branches, 40+ doctors, 15,000+ patients served with world-class care.' },
]

const VALUES = [
  { icon: Heart, title: 'Compassion', desc: 'Every patient is treated with dignity, empathy, and genuine care.' },
  { icon: Eye, title: 'Precision', desc: 'Evidence-based medicine with accurate diagnoses and treatments.' },
  { icon: Target, title: 'Excellence', desc: 'Continuously improving our standards to deliver exceptional outcomes.' },
  { icon: Users, title: 'Community', desc: 'Building lasting relationships with our patients and families.' },
]

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="accent" dot className="mb-6">Our Story</Badge>
              <h1 className="font-manrope font-extrabold text-display-lg text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
                Redefining What Healthcare{' '}
                <span className="gradient-text">Should Feel Like</span>
              </h1>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                Born from a belief that every person deserves healthcare that respects their time, privacy, and dignity, LuminaCare was founded to bridge the gap between medical excellence and genuine human connection.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-white dark:bg-neutral-900 border-y border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center">
                  <Target size={20} className="text-accent-500" />
                </div>
                <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Our Mission</h2>
              </div>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                To deliver accessible, compassionate, and technologically advanced healthcare that empowers patients to take control of their well-being — from the first consultation to the last follow-up.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center">
                  <Eye size={20} className="text-accent-500" />
                </div>
                <h2 className="font-manrope font-bold text-heading-xl text-neutral-900 dark:text-neutral-100">Our Vision</h2>
              </div>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                To become India's most trusted healthcare platform — where every patient feels seen, every doctor feels supported, and every interaction builds health, trust, and community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="accent" dot className="mb-4">Our Values</Badge>
            <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">
              The Principles That Guide Us
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-soft-sm text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-accent-500" />
                </div>
                <h3 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-cream-200 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="accent" dot className="mb-4">Our Journey</Badge>
            <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">
              A Decade of Growth
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-border-light dark:bg-border-dark lg:-translate-x-px" />

            <div className="space-y-8">
              {TIMELINE.map(({ year, title, desc }, i) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative flex gap-8 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} pl-16 lg:pl-0`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 lg:left-1/2 top-6 w-4 h-4 rounded-full bg-accent-500 ring-4 ring-accent-100 dark:ring-accent-500/20 lg:-translate-x-2 z-10" />

                  {/* Content */}
                  <div className={`lg:w-1/2 ${i % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className="bg-white dark:bg-neutral-950 border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-soft-sm">
                      <span className="font-manrope font-bold text-accent-500 text-body-sm">{year}</span>
                      <h3 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100 mt-1">{title}</h3>
                      <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">{desc}</p>
                    </div>
                  </div>

                  <div className="hidden lg:block lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '14+', label: 'Years of Service', icon: Clock },
              { value: '40+', label: 'Expert Doctors', icon: Users },
              { value: '8', label: 'Clinic Branches', icon: Award },
              { value: '15K+', label: 'Happy Patients', icon: Heart },
            ].map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-accent-500" />
                </div>
                <p className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">{value}</p>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
