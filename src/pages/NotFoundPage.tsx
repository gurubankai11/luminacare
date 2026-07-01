import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-neutral-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 visual */}
          <div className="relative mb-8">
            <p className="font-manrope font-extrabold text-[120px] md:text-[160px] leading-none text-neutral-100 dark:text-neutral-900 select-none">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-accent-500 flex items-center justify-center shadow-glow-accent">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mb-3">
            Page Not Found
          </h1>
          <p className="text-body-lg text-neutral-500 dark:text-neutral-400 mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="lg" leftIcon={<Home size={16} />} onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
            <Button variant="ghost" size="lg" leftIcon={<ArrowLeft size={16} />} onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Book Appointment', href: '/book-appointment' },
              { label: 'Our Doctors', href: '/doctors' },
              { label: 'Contact Us', href: '/contact' },
            ].map(l => (
              <Link key={l.href} to={l.href} className="text-body-sm text-accent-600 dark:text-accent-400 hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
