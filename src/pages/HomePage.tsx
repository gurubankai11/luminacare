import { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  ArrowRight, Star, Shield, Clock, Heart, ChevronRight,
  Stethoscope, Activity, Syringe, FlaskConical, Bone, Zap,
  Phone, Calendar, Users, Award
} from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'

/* ─── Animated Bubble Hero ─── */
interface Bubble {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  blur: number
  color: string
  speed: number
  angle: number
}

const BUBBLE_COLORS_LIGHT = [
  'rgba(91, 155, 213, 0.12)',
  'rgba(147, 197, 253, 0.15)',
  'rgba(186, 230, 253, 0.18)',
  'rgba(224, 242, 254, 0.20)',
  'rgba(91, 155, 213, 0.08)',
]

function HeroBubbles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<Bubble[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    bubblesRef.current = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 120 + Math.random() * 240,
      opacity: 0.4 + Math.random() * 0.4,
      blur: 40 + Math.random() * 40,
      color: BUBBLE_COLORS_LIGHT[i % BUBBLE_COLORS_LIGHT.length],
      speed: 0.004 + Math.random() * 0.006,
      angle: Math.random() * Math.PI * 2,
    }))

    let lastTime = 0
    const animate = (time: number) => {
      const delta = time - lastTime
      lastTime = time

      if (delta < 32) {
        bubblesRef.current = bubblesRef.current.map(bubble => {
          bubble.angle += bubble.speed
          let nx = bubble.x + Math.sin(bubble.angle * 0.7) * 0.08
          let ny = bubble.y + Math.cos(bubble.angle * 0.5) * 0.06

          // Mouse repel
          const container = containerRef.current
          if (container) {
            const rect = container.getBoundingClientRect()
            const mx = ((mouseRef.current.x - rect.left) / rect.width) * 100
            const my = ((mouseRef.current.y - rect.top) / rect.height) * 100
            const dx = nx - mx
            const dy = ny - my
            const dist = Math.sqrt(dx * dx + dy * dy)
            const repelRadius = 18
            if (dist < repelRadius && dist > 0) {
              const force = (repelRadius - dist) / repelRadius * 0.3
              nx += (dx / dist) * force
              ny += (dy / dist) * force
            }
          }

          // Wrap around edges
          if (nx < -20) nx = 110
          if (nx > 110) nx = -20
          if (ny < -20) ny = 110
          if (ny > 110) ny = -20

          return { ...bubble, x: nx, y: ny }
        })
      }

      animFrameRef.current = requestAnimationFrame(animate)
      forceUpdate(v => v + 1)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {bubblesRef.current.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: bubble.color,
            filter: `blur(${bubble.blur}px)`,
            opacity: bubble.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
          }}
        />
      ))}
    </div>
  )
}

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      <div style={{ transform: 'translateZ(30px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  )
}

/* ─── Stats ─── */
const STATS = [
  { value: '15,000+', label: 'Patients Served', icon: Users },
  { value: '40+', label: 'Expert Doctors', icon: Stethoscope },
  { value: '8', label: 'Branch Clinics', icon: Award },
  { value: '24/7', label: 'Emergency Care', icon: Heart },
]

/* ─── Services ─── */
const SERVICES = [
  { icon: Stethoscope, label: 'General Consultation', desc: 'Comprehensive health assessments by our experienced physicians.', color: 'blue' },
  { icon: Activity, label: 'Cardiology', desc: 'Advanced cardiac care and heart health monitoring.', color: 'rose' },
  { icon: Bone, label: 'Orthopedics', desc: 'Specialized bone, joint, and muscle treatment.', color: 'amber' },
  { icon: FlaskConical, label: 'Laboratory', desc: 'Accurate diagnostics with state-of-the-art equipment.', color: 'emerald' },
  { icon: Syringe, label: 'Vaccination', desc: 'Comprehensive immunization programs for all ages.', color: 'purple' },
  { icon: Heart, label: 'Diabetes Care', desc: 'Holistic diabetes management and monitoring.', color: 'pink' },
  { icon: Zap, label: 'Emergency Care', desc: 'Round-the-clock urgent and emergency medical services.', color: 'orange' },
  { icon: Shield, label: 'Health Checkup', desc: 'Preventive health packages tailored to your needs.', color: 'teal' },
]

const serviceColorMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  pink: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
}



/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    name: 'Ananya Krishnan',
    role: 'Patient',
    content: "LuminaCare completely changed my experience with healthcare. The doctors are incredibly attentive, and the app makes everything so seamless.",
    rating: 5,
  },
  {
    name: 'Sanjay Verma',
    role: 'Regular Patient',
    content: "I've been coming here for 3 years. The live queue system alone saves me hours every week. Absolutely world-class service.",
    rating: 5,
  },
  {
    name: 'Meera Pillai',
    role: 'Patient',
    content: "The digital prescriptions and test reports are a game changer. I can share them with specialists instantly. Truly modern healthcare.",
    rating: 5,
  },
]

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60])
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'doctor').limit(3).then(({ data }) => {
      if (data && data.length > 0) {
        setDoctors(data)
      } else {
        setDoctors([
          { id: 'demo-doc-1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology' },
          { id: 'demo-doc-2', name: 'Dr. Michael Chen', specialty: 'Neurology' }
        ])
      }
    })
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' as const },
  }

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  }

  return (
    <PageWrapper>
      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient"
        aria-label="Hero section"
      >
        <HeroBubbles />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-subtle-grid" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
        >
          {/* Badge */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1, ...fadeInUp.transition }}>
            <Badge variant="accent" size="md" dot className="mb-8">
              Premium Healthcare Platform
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="font-manrope font-extrabold text-display-xl text-neutral-900 dark:text-neutral-100 text-balance leading-tight mb-6"
          >
            Healthcare{' '}
            <span className="relative">
              <span className="gradient-text">Designed</span>
            </span>
            {' '}Around You
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="font-inter text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-balance mb-10"
          >
            Experience medical care that combines compassion, precision, and cutting-edge technology.
            Your health journey, seamlessly managed from appointment to recovery.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="primary"
              size="xl"
              rightIcon={<Calendar size={18} />}
              onClick={() => window.location.href = '/book-appointment'}
            >
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              size="xl"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => window.location.href = '/services'}
              className="text-neutral-700 dark:text-neutral-300"
            >
              Explore Services
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12"
          >
            {[
              { icon: Shield, label: 'NABH Accredited' },
              { icon: Star, label: '4.9★ Rated' },
              { icon: Clock, label: '24/7 Support' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-body-sm text-neutral-500 dark:text-neutral-400">
                <Icon size={15} className="text-accent-500" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-caption text-neutral-400 dark:text-neutral-600 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-white dark:bg-neutral-900 border-y border-border-light dark:border-border-dark" aria-label="Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-accent-500" />
                </div>
                <p className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">{value}</p>
                <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 section-padding" aria-label="Our services">
        <div className="section-max">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="accent" dot className="mb-4">Our Services</Badge>
              <h2 className="font-manrope font-bold text-display-md text-neutral-900 dark:text-neutral-100 mb-4">
                Comprehensive Care,{' '}
                <span className="gradient-text">One Destination</span>
              </h2>
              <p className="text-body-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
                From routine check-ups to specialized treatments — we cover all aspects of your health.
              </p>
            </motion.div>
          </div>

          {/* Service Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {SERVICES.map(({ icon: Icon, label, desc, color }) => (
              <motion.div
                key={label}
                variants={{
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } }
                }}
                className="group"
              >
                <Link to="/services" className="block h-full">
                  <TiltCard className="h-full">
                    <div className="h-full bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-soft-sm hover:shadow-soft-lg hover:border-accent-200 dark:hover:border-accent-600/40 transition-all duration-300 cursor-pointer">

                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-5', serviceColorMap[color])}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-manrope font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 mb-2">{label}</h3>
                    <p className="text-body-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                    <div className="flex items-center gap-1.5 mt-5 text-accent-500 dark:text-accent-400 text-body-sm font-medium group-hover:gap-2.5 transition-all duration-200">
                      <span>Learn more</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/services'}>
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 bg-neutral-950 text-white overflow-hidden" aria-label="Why choose us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Badge variant="accent" dot className="mb-6">Why LuminaCare</Badge>
                <h2 className="font-manrope font-bold text-display-md text-white mb-6 leading-tight">
                  Where Technology Meets{' '}
                  <span className="text-accent-400">Compassionate</span>{' '}
                  Care
                </h2>
                <p className="text-body-lg text-neutral-400 leading-relaxed">
                  We believe healthcare should feel personal, not institutional. Every interaction is designed to put you at ease while delivering the highest standard of medical excellence.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {[
                  { icon: Clock, title: 'Live Queue System', desc: 'Know your exact wait time. No surprises.' },
                  { icon: Shield, title: 'Digital Records', desc: 'Your complete health history, always accessible.' },
                  { icon: Phone, title: 'Real-time Chat', desc: 'Message your doctor anytime, anywhere.' },
                  { icon: Star, title: 'Expert Doctors', desc: '40+ specialists with decades of experience.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-accent-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-body-md text-white">{title}</h3>
                      <p className="text-caption text-neutral-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — decorative card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-dark-md">
                {/* Appointment card mockup */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-caption text-neutral-500 uppercase tracking-widest">Next Appointment</p>
                    <p className="font-manrope font-semibold text-heading-lg text-white mt-1">Dr. Arjun Mehta</p>
                    <p className="text-body-sm text-neutral-400">Cardiologist</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center">
                    <Activity size={24} className="text-accent-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-800 rounded-2xl p-4">
                    <p className="text-caption text-neutral-500 mb-1">Date</p>
                    <p className="font-semibold text-white text-body-md">July 15, 2026</p>
                  </div>
                  <div className="bg-neutral-800 rounded-2xl p-4">
                    <p className="text-caption text-neutral-500 mb-1">Time</p>
                    <p className="font-semibold text-white text-body-md">10:30 AM</p>
                  </div>
                </div>

                <div className="bg-neutral-800 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-caption text-neutral-500">Queue Position</p>
                    <span className="badge-accent text-xs px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">Live</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-manrope font-bold text-3xl text-white">#3</span>
                    <div className="flex-1">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className={cn('h-1.5 flex-1 rounded-full', n <= 3 ? 'bg-accent-500' : 'bg-neutral-700')} />
                        ))}
                      </div>
                      <p className="text-caption text-neutral-500 mt-1">~15 min wait</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="status-online" />
                  <span className="text-caption text-emerald-400">Clinic Open Now</span>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -right-5 bg-white dark:bg-neutral-100 rounded-2xl px-4 py-3 shadow-soft-xl"
              >
                <p className="text-caption text-neutral-500 font-medium">Token Generated</p>
                <p className="font-manrope font-bold text-heading-md text-neutral-900">#LC-0042</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section className="py-24 section-padding" aria-label="Our doctors">
        <div className="section-max">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="accent" dot className="mb-4">Meet Our Team</Badge>
              <h2 className="font-manrope font-bold text-display-md text-neutral-900 dark:text-neutral-100 mb-4">
                Trusted by Thousands,{' '}
                <span className="gradient-text">Led by Experts</span>
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <TiltCard className="h-full">
                  <div className="h-full bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-lg transition-all duration-300">
                  {/* Doctor avatar area */}
                  <div className="h-48 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-500/10 dark:to-accent-500/5 flex items-center justify-center relative">
                    {doc.avatar_url ? (
                      <img src={doc.avatar_url} alt={doc.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 shadow-soft-md object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-200 dark:bg-accent-500/30 flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-soft-md">
                        <Stethoscope size={36} className="text-accent-600 dark:text-accent-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-caption font-semibold text-neutral-800 dark:text-neutral-200">4.9</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">{doc.name}</h3>
                    <p className="text-body-sm text-accent-600 dark:text-accent-400 font-medium mt-0.5">Specialist</p>
                    <p className="text-caption text-neutral-500 dark:text-neutral-400 mt-1">MD</p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                      <div>
                        <p className="text-caption text-neutral-400">Experience</p>
                        <p className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200">10+ years</p>
                      </div>
                      <div className="text-right">
                        <p className="text-caption text-neutral-400">Availability</p>
                        <p className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200">Mon–Sat</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="mt-5"
                      onClick={() => window.location.href = '/book-appointment'}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => window.location.href = '/doctors'}>
              View All Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-cream-200 dark:bg-neutral-900" aria-label="Patient testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="accent" dot className="mb-4">Testimonials</Badge>
              <h2 className="font-manrope font-bold text-display-md text-neutral-900 dark:text-neutral-100">
                Patients Who Trust Us
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bg-white dark:bg-neutral-950 border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-soft-sm h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-body-md text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1">"{t.content}"</p>
                  <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-body-md">{t.name}</p>
                    <p className="text-caption text-neutral-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 section-padding" aria-label="Call to action">
        <div className="section-max">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-accent-500 rounded-3xl p-12 lg:p-16 overflow-hidden text-center"
          >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <h2 className="font-manrope font-bold text-display-md text-white mb-4">
                Ready to Experience Premium Healthcare?
              </h2>
              <p className="text-body-lg text-blue-100 max-w-xl mx-auto mb-10">
                Book your appointment today and join thousands of patients who trust LuminaCare with their health.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => window.location.href = '/book-appointment'}
                  className="bg-white text-accent-600 hover:bg-blue-50 border-transparent shadow-soft-lg"
                >
                  Book Appointment
                </Button>
                <Button
                  variant="ghost"
                  size="xl"
                  onClick={() => window.location.href = '/contact'}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  )
}
