import { Link } from 'react-router-dom'
import { Phone, Mail, Clock, Globe, MessageCircle, Share2, AtSign } from 'lucide-react'

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Doctors', href: '/doctors' },
    { label: 'Branches', href: '/branches' },
  ],
  'Services': [
    { label: 'General Consultation', href: '/services' },
    { label: 'Cardiology', href: '/services' },
    { label: 'Orthopedics', href: '/services' },
    { label: 'Emergency Care', href: '/services' },
    { label: 'Laboratory', href: '/services' },
  ],
  'Patient Portal': [
    { label: 'Book Appointment', href: '/book-appointment' },
    { label: 'Patient Login', href: '/login/patient' },
    { label: 'Doctor Login', href: '/login/doctor' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const SOCIAL_LINKS = [
  { icon: AtSign, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
  { icon: Share2, href: '#', label: 'LinkedIn' },
  { icon: Globe, href: '#', label: 'Facebook' },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-manrope font-bold text-lg text-white tracking-tight">
                Lumina<span className="text-accent-400">Care</span>
              </span>
            </Link>
            <p className="text-body-sm text-neutral-500 leading-relaxed mb-6 max-w-xs">
              Healthcare designed around you. Premium medical care with compassion, precision, and technology — all in one place.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-body-sm text-neutral-400">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-accent-400" />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-neutral-400">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-accent-400" />
                </div>
                <span>care@luminacare.in</span>
              </div>
              <div className="flex items-start gap-3 text-body-sm text-neutral-400">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={14} className="text-accent-400" />
                </div>
                <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 mt-6">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-accent-400 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-manrope font-semibold text-body-sm text-white mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href + link.label}>
                    <Link
                      to={link.href}
                      className="text-body-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-900 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-neutral-600">
            © {new Date().getFullYear()} LuminaCare. All rights reserved.
          </p>
          <p className="text-caption text-neutral-700 flex items-center gap-1">
            Designed & built with precision
          </p>
        </div>
      </div>
    </footer>
  )
}
