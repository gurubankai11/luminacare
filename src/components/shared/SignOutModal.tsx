import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'

export default function SignOutModal() {
  const { isSignOutModalOpen, closeSignOutModal, signOut } = useAuthStore()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()
  
  const modalRef = useRef<HTMLDivElement>(null)
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSignOutModalOpen && !isSigningOut) {
        closeSignOutModal()
      }
      
      // Simple focus trap
      if (e.key === 'Tab' && isSignOutModalOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    if (isSignOutModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus cancel button on mount for accessibility
      setTimeout(() => cancelBtnRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSignOutModalOpen, isSigningOut, closeSignOutModal])

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    
    try {
      await signOut()
      closeSignOutModal()
      navigate('/login/patient') // Redirect to Login page as requested
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <AnimatePresence>
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => !isSigningOut && closeSignOutModal()} 
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-modal-title"
            aria-describedby="signout-modal-desc"
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-800/50">
              <h2 id="signout-modal-title" className="font-bold text-heading-md text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <LogOut size={20} className="text-neutral-500" />
                Sign Out?
              </h2>
              <button 
                onClick={() => !isSigningOut && closeSignOutModal()} 
                className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Close modal"
                disabled={isSigningOut}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p id="signout-modal-desc" className="text-body-md text-neutral-600 dark:text-neutral-300">
                Are you sure you want to sign out of your LuminaCare account?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-800/50 flex justify-end gap-3">
              <Button 
                ref={cancelBtnRef}
                type="button" 
                variant="outline" 
                onClick={() => closeSignOutModal()} 
                disabled={isSigningOut}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleSignOut} 
                isLoading={isSigningOut}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
