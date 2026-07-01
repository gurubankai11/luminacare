import { motion } from 'framer-motion'
import { ChevronRight, Stethoscope, Activity, Bone, FlaskConical, Syringe, Heart, Zap, Shield, Eye, Brain, Baby, Leaf } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'

const SERVICES = [
  {
    icon: Stethoscope,
    name: 'General Consultation',
    description: 'Comprehensive health assessments, routine check-ups, and primary care by experienced general physicians.',
    features: ['Health assessments', 'Chronic disease management', 'Preventive care', 'Referrals & follow-ups'],
    color: 'blue',
    timing: 'Mon – Sat, 9 AM – 7 PM',
  },
  {
    icon: Heart,
    name: 'Diabetes Care',
    description: 'Holistic management of Type 1 & Type 2 diabetes including monitoring, diet counseling, and medication management.',
    features: ['HbA1c monitoring', 'Diet counseling', 'Insulin management', 'Foot care'],
    color: 'pink',
    timing: 'Mon – Sat, 10 AM – 5 PM',
  },
  {
    icon: Activity,
    name: 'Cardiology',
    description: 'Advanced cardiac care for heart disease prevention, diagnosis, and management with state-of-the-art diagnostics.',
    features: ['ECG & Echo', 'Stress testing', 'Lipid management', 'Cardiac rehab'],
    color: 'rose',
    timing: 'Mon, Wed, Fri, 10 AM – 4 PM',
  },
  {
    icon: Bone,
    name: 'Orthopedics',
    description: 'Specialized care for bone, joint, and muscle conditions including sports injuries and degenerative disorders.',
    features: ['Joint replacement', 'Sports injuries', 'Spine care', 'Physical therapy'],
    color: 'amber',
    timing: 'Tue, Thu, Sat, 9 AM – 5 PM',
  },
  {
    icon: Zap,
    name: 'Emergency Care',
    description: '24/7 emergency medical services with rapid response, trauma care, and critical care management.',
    features: ['24/7 availability', 'Trauma management', 'Critical care', 'Ambulance support'],
    color: 'orange',
    timing: '24 Hours, All Days',
  },
  {
    icon: Shield,
    name: 'Health Checkup',
    description: 'Comprehensive preventive health packages tailored for different age groups and health goals.',
    features: ['Basic package', 'Executive package', 'Senior package', "Women's health"],
    color: 'teal',
    timing: 'Mon – Sat, 8 AM – 2 PM',
  },
  {
    icon: Syringe,
    name: 'Vaccination',
    description: 'Complete immunization programs for infants, children, adults, and travel vaccination needs.',
    features: ['Childhood vaccines', 'Adult boosters', 'Travel vaccines', 'COVID-19'],
    color: 'purple',
    timing: 'Mon – Sat, 9 AM – 6 PM',
  },
  {
    icon: FlaskConical,
    name: 'Laboratory',
    description: 'Accurate and rapid diagnostic testing with a comprehensive range of blood, urine, and specialized tests.',
    features: ['Blood tests', 'Urine analysis', 'Cultures', 'Home collection'],
    color: 'emerald',
    timing: 'Mon – Sat, 7 AM – 8 PM',
  },
  {
    icon: Eye,
    name: 'Ophthalmology',
    description: 'Complete eye care services from routine vision checks to advanced treatment of eye conditions.',
    features: ['Vision testing', 'Cataract care', 'Glaucoma', 'Retinal exams'],
    color: 'cyan',
    timing: 'Tue, Thu, Sat, 10 AM – 4 PM',
  },
  {
    icon: Brain,
    name: 'Neurology',
    description: 'Expert care for neurological disorders including headaches, epilepsy, stroke, and nerve conditions.',
    features: ['EEG & NCV', 'Migraine care', 'Stroke rehab', 'Memory clinic'],
    color: 'violet',
    timing: 'Mon, Wed, 10 AM – 3 PM',
  },
  {
    icon: Baby,
    name: 'Pediatrics',
    description: 'Dedicated care for children from newborns to adolescents including growth monitoring and immunizations.',
    features: ['Newborn care', 'Growth tracking', 'Child nutrition', 'Developmental checks'],
    color: 'sky',
    timing: 'Mon – Sat, 9 AM – 6 PM',
  },
  {
    icon: Leaf,
    name: 'Wellness & Nutrition',
    description: 'Personalized wellness plans, diet counseling, and lifestyle modification programs.',
    features: ['Diet plans', 'Weight management', 'Stress management', 'Lifestyle coaching'],
    color: 'lime',
    timing: 'Mon – Fri, 10 AM – 5 PM',
  },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  pink: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
  lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400',
}

export default function ServicesPage() {
  const navigate = useNavigate();
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
            <Badge variant="accent" dot className="mb-6">Medical Services</Badge>
            <h1 className="font-manrope font-extrabold text-display-lg text-neutral-900 dark:text-neutral-100 mb-5">
              All Your Health Needs,{' '}
              <span className="gradient-text">One Place</span>
            </h1>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              From preventive care to specialized treatment, our comprehensive services ensure you receive the right care at every stage of your health journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, name, description, features, color, timing }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="h-full bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-soft-sm hover:shadow-soft-lg hover:border-accent-200 dark:hover:border-accent-600/30 transition-all duration-300">
                  {/* Icon */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-5', colorMap[color])}>
                    <Icon size={22} />
                  </div>

                  {/* Name */}
                  <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100 mb-2">{name}</h2>
                  <p className="text-body-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">{description}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-5">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-body-sm text-neutral-600 dark:text-neutral-400">
                        <ChevronRight size={13} className="text-accent-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Timing */}
                  <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                    <p className="text-caption text-neutral-400 dark:text-neutral-500">{timing}</p>
                    <Link
                      to="/book-appointment"
                      className="text-body-sm font-medium text-accent-600 dark:text-accent-400 flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                    >
                      Book <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mb-4">
            Not sure which service you need?
          </h2>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400 mb-8">
            Book a general consultation and let our doctors guide you to the right specialist.
          </p>
          <Button variant="primary" size="xl" onClick={() => navigate('/book-appointment')}>
            Book General Consultation
          </Button>
        </div>
      </section>
    </PageWrapper>
  )
}
