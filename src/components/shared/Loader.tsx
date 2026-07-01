import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoaderProps {
  onComplete: () => void
}

export default function Loader({ onComplete }: LoaderProps) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('done')
      setTimeout(onComplete, 800)
    }, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-100 dark:bg-neutral-950"
        >
          {/* Background subtle pattern */}
          <div className="absolute inset-0 bg-subtle-grid opacity-40" />

          {/* Soft radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center gap-8">
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-accent-500 flex items-center justify-center shadow-glow-accent"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <motion.path
                  d="M12 8V16M8 12H16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            {/* Brand name */}
            <div className="flex flex-col items-center gap-2">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="font-manrope font-bold text-4xl text-neutral-900 dark:text-neutral-100 tracking-tight"
              >
                Lumina<span className="text-accent-500">Care</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="font-inter text-body-sm text-neutral-500 dark:text-neutral-400 tracking-widest uppercase"
              >
                Healthcare Designed Around You
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="w-48 h-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-accent-500 origin-left rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
