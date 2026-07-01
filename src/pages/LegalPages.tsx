import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'

export function PrivacyPage() {
  return (
    <PageWrapper>
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Badge variant="accent" dot className="mb-4">Legal</Badge>
          <h1 className="font-manrope font-extrabold text-display-md text-neutral-900 dark:text-neutral-100 mb-3">Privacy Policy</h1>
          <p className="text-body-sm text-neutral-400 mb-10">Last updated: June 28, 2026</p>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {[
              { title: '1. Information We Collect', body: 'We collect personal information you provide when booking appointments (name, phone, email, address, health details), account information during registration, usage data through cookies, and device/browser information.' },
              { title: '2. How We Use Your Information', body: 'Your information is used to: schedule and manage appointments, send reminders and notifications, communicate with healthcare providers, improve our services, comply with legal obligations, and generate anonymized health analytics.' },
              { title: '3. Medical Data & Confidentiality', body: 'All medical records, prescriptions, test reports, and health data are treated with the highest level of confidentiality. We comply with applicable healthcare privacy laws. Your health data is never sold to third parties.' },
              { title: '4. Data Sharing', body: 'We share your data only with: doctors assigned to your care, branches you visit, essential service providers (SMS, email), and as required by law. We never sell your personal data.' },
              { title: '5. Data Security', body: 'We use industry-standard encryption (TLS/SSL), secure cloud storage (Supabase), role-based access controls, and regular security audits to protect your data.' },
              { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@luminacare.in to exercise these rights.' },
              { title: '7. Cookies', body: 'We use essential cookies for authentication and preferences. You can control cookie settings through your browser.' },
              { title: '8. Contact', body: 'For privacy concerns, contact our Data Protection Officer at: privacy@luminacare.in or +91 98765 43210.' },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="font-manrope font-bold text-heading-lg text-neutral-900 dark:text-neutral-100 mb-3">{title}</h2>
                <p className="text-body-md text-neutral-600 dark:text-neutral-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}

export function TermsPage() {
  return (
    <PageWrapper>
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Badge variant="accent" dot className="mb-4">Legal</Badge>
          <h1 className="font-manrope font-extrabold text-display-md text-neutral-900 dark:text-neutral-100 mb-3">Terms of Service</h1>
          <p className="text-body-sm text-neutral-400 mb-10">Last updated: June 28, 2026</p>
          <div className="space-y-8">
            {[
              { title: '1. Acceptance of Terms', body: 'By using LuminaCare services, you agree to these terms. If you do not agree, please do not use our platform.' },
              { title: '2. Medical Disclaimer', body: 'LuminaCare is a platform connecting patients with healthcare providers. Information on this platform is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified physician.' },
              { title: '3. Appointment Policy', body: 'Appointments must be cancelled at least 2 hours in advance. No-shows may result in account restrictions. Emergency cancellations are always accommodated.' },
              { title: '4. User Responsibilities', body: 'You agree to provide accurate information, maintain account security, use the platform only for legitimate healthcare purposes, and not misuse the chat or prescription features.' },
              { title: '5. Intellectual Property', body: 'All content, branding, and technology on LuminaCare is proprietary. You may not copy, modify, or redistribute without written permission.' },
              { title: '6. Limitation of Liability', body: 'LuminaCare is not liable for medical decisions made by healthcare providers. Our liability is limited to the fees paid for platform services.' },
              { title: '7. Termination', body: 'We reserve the right to terminate accounts that violate these terms. You may delete your account at any time through Settings.' },
              { title: '8. Governing Law', body: 'These terms are governed by the laws of Maharashtra, India. Disputes shall be resolved in Mumbai courts.' },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="font-manrope font-bold text-heading-lg text-neutral-900 dark:text-neutral-100 mb-3">{title}</h2>
                <p className="text-body-md text-neutral-600 dark:text-neutral-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
