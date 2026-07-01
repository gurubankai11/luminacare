import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, User, Sun, Moon, Monitor, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../ui'
import Button from '../ui/Button'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Branches', href: '/branches' },
  { label: 'Contact', href: '/contact' },
]

const LOGIN_OPTIONS = [
  { label: 'Patient Login', href: '/login/patient', icon: '👤' },
  { label: 'Doctor Login', href: '/login/doctor', icon: '🩺' },
  { label: 'Reception Login', href: '/login/reception', icon: '🏥' },
  { label: 'Admin Login', href: '/login/admin', icon: '⚙️' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginDropdown, setLoginDropdown] = useState(false)
  const [themeDropdown, setThemeDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()
  const { user, isAuthenticated, openSignOutModal } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setLoginDropdown(false)
    setThemeDropdown(false)
    setProfileDropdown(false)
  }, [location.pathname])

  const handleSignOut = () => {
    setProfileDropdown(false)
    setMobileOpen(false)
    openSignOutModal()
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    const map = { patient: '/dashboard/patient', doctor: '/dashboard/doctor', reception: '/dashboard/reception', admin: '/dashboard/admin' }
    return map[user.role] || '/'
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled ? 'navbar-glass shadow-soft-sm' : 'bg-transparent'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="LuminaCare Home">
              <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center shadow-glow-accent-sm group-hover:shadow-glow-accent transition-shadow duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-manrope font-bold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight">
                Lumina<span className="text-accent-500">Care</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-body-sm font-medium transition-all duration-200',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    location.pathname === link.href
                      ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-500/10'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2">

              {/* Theme toggle */}
              <div className="relative">
                <button
                  onClick={() => setThemeDropdown(v => !v)}
                  className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
                  aria-label="Change theme"
                >
                  <ThemeIcon size={18} />
                </button>
                <AnimatePresence>
                  {themeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl shadow-soft-lg overflow-hidden"
                    >
                      {[
                        { label: 'Light', value: 'light' as const, icon: Sun },
                        { label: 'Dark', value: 'dark' as const, icon: Moon },
                        { label: 'System', value: 'system' as const, icon: Monitor },
                      ].map(({ label, value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => { setTheme(value); setThemeDropdown(false) }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-medium transition-colors',
                            theme === value
                              ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-500/10'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                          )}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Book Appointment CTA */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/book-appointment')}
              >
                Book Now
              </Button>

              {/* Login / User */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
                  >
                    <Avatar name={user.name || user.email} size="sm" />
                    <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-24 truncate">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>
                  <AnimatePresence>
                    {profileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl shadow-soft-lg overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                          <p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                          <p className="text-caption text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { navigate(getDashboardLink()); setProfileDropdown(false) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <User size={15} />
                            My Dashboard
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronDown size={14} />}
                    onClick={() => setLoginDropdown(v => !v)}
                  >
                    Login
                  </Button>
                  <AnimatePresence>
                    {loginDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl shadow-soft-lg overflow-hidden"
                      >
                        {LOGIN_OPTIONS.map(opt => (
                          <Link
                            key={opt.href}
                            to={opt.href}
                            className="flex items-center gap-3 px-4 py-3 text-body-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <span className="text-base">{opt.icon}</span>
                            {opt.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-neutral-950 shadow-soft-2xl border-l border-border-light dark:border-border-dark lg:hidden"
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto">
              <div className="space-y-1 flex-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl text-body-md font-medium transition-all duration-200',
                      location.pathname === link.href
                        ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-500/10'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-border-light dark:border-border-dark pt-6 space-y-3">
                <Button variant="outline" size="md" fullWidth onClick={() => navigate('/book-appointment')}>
                  Book Appointment
                </Button>
                {isAuthenticated && user ? (
                  <>
                    <Button variant="secondary" size="md" fullWidth onClick={() => navigate(getDashboardLink())}>
                      My Dashboard
                    </Button>
                    <Button variant="ghost" size="md" fullWidth onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    {LOGIN_OPTIONS.map(opt => (
                      <Link
                        key={opt.href}
                        to={opt.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-body-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <span>{opt.icon}</span>
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
