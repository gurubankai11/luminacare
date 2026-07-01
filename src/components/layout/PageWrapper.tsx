import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

interface PageWrapperProps {
  children: ReactNode
  showFooter?: boolean
  className?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function PageWrapper({ children, showFooter = true, className }: PageWrapperProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-cream-100 dark:bg-neutral-950 ${className || ''}`}>
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="flex-1"
      >
        {children}
      </motion.main>
      {showFooter && <Footer />}
    </div>
  )
}
