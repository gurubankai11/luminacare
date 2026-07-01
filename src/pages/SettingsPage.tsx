import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sun, Moon, Monitor, Globe, Bell, Lock, User as UserIcon, Save } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Badge } from '../components/ui'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import { uploadFile } from '../lib/storage'
import toast from 'react-hot-toast'
import { useRef } from 'react'

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useThemeStore()
  const { user, refreshUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    height: '',
    weight: '',
    medical_history: '',
    allergies: '',
    insurance_provider: '',
    insurance_id: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        age: user.age ? String(user.age) : '',
        address: user.address || '',
        emergency_contact_name: user.emergency_contact?.name || '',
        emergency_contact_phone: user.emergency_contact?.phone || '',
        blood_group: user.blood_group || '',
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        medical_history: user.medical_history || '',
        allergies: user.allergies && Array.isArray(user.allergies) ? user.allergies.join(', ') : '',
        insurance_provider: user.insurance?.provider || '',
        insurance_id: user.insurance?.id || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        name: profileData.name,
        phone: profileData.phone,
        dob: profileData.age ? new Date(new Date().getFullYear() - parseInt(profileData.age), 0, 1).toISOString().split('T')[0] : null,
        gender: profileData.gender || null,
        address: profileData.address,
        emergency_contact: {
          name: profileData.emergency_contact_name,
          phone: profileData.emergency_contact_phone
        },
        blood_group: profileData.blood_group || null,
        height: profileData.height,
        weight: profileData.weight,
        medical_history: profileData.medical_history,
        allergies: profileData.allergies ? profileData.allergies.split(',').map(a => a.trim()) : [],
        insurance: {
          provider: profileData.insurance_provider,
          id: profileData.insurance_id
        }
      }).eq('id', user.id)

      if (error) throw error
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return
    const file = e.target.files[0]
    setIsUploadingAvatar(true)
    
    try {
      const { url, error } = await uploadFile('avatars', user.id, file)
      if (error) throw new Error(error)
      
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      if (updateError) throw updateError
      
      await refreshUser()
      toast.success('Avatar updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const THEME_OPTIONS = [
    { value: 'light' as const, label: 'Light', icon: Sun, desc: 'Always light theme' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Always dark theme' },
    { value: 'system' as const, label: 'System', icon: Monitor, desc: 'Follows device preference' },
  ]

  const LANG_OPTIONS = [
    { value: 'en' as const, label: 'English', flag: '🇬🇧' },
    { value: 'hi' as const, label: 'हिन्दी', flag: '🇮🇳' },
  ]

  const NOTIFICATION_PREFS = [
    { label: 'Appointment Reminders', desc: 'Notified 24h before appointments', checked: true },
    { label: 'Medicine Reminders', desc: 'Daily dose time notifications', checked: true },
    { label: 'Lab Report Ready', desc: 'Instant notification when reports upload', checked: true },
    { label: 'Chat Messages', desc: 'Real-time message notifications', checked: false },
    { label: 'Promotional Updates', desc: 'Health tips and clinic news', checked: false },
  ]

  // Calculate profile completion percentage
  const profileFields = Object.values(profileData)
  const filledFields = profileFields.filter(f => f && String(f).trim().length > 0).length
  const completionPercentage = Math.round((filledFields / profileFields.length) * 100)

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="accent" dot className="mb-4">Preferences</Badge>
            <h1 className="font-manrope font-extrabold text-display-md text-neutral-900 dark:text-neutral-100 mb-2">Settings & Profile</h1>
            <p className="text-body-lg text-neutral-500 dark:text-neutral-400 mb-10">Manage your account preferences, profile details, and app settings.</p>
          </motion.div>

          <div className="space-y-6">
            
            {/* Profile */}
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><UserIcon size={16} className="text-accent-500" /></div>
                <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">Personal Profile</h2>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-body-sm font-medium text-neutral-500">Profile Complete: {completionPercentage}%</span>
                    <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-500 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-cream-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border-2 border-accent-500">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={32} className="text-neutral-400" />
                    )}
                </div>
                <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                    <Button type="button" variant="outline" size="sm" isLoading={isUploadingAvatar} onClick={() => fileInputRef.current?.click()}>
                      Choose Avatar
                    </Button>
                    <p className="text-caption text-neutral-400 mt-2">Upload a profile picture (JPG/PNG).</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  <Input label="Phone Number" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  <Input label="Age" type="number" value={profileData.age} onChange={(e) => setProfileData({...profileData, age: e.target.value})} />
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Gender</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      value={profileData.gender} 
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="Address" className="sm:col-span-2" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} />
                  
                  <Input label="Emergency Contact Name" value={profileData.emergency_contact_name} onChange={(e) => setProfileData({...profileData, emergency_contact_name: e.target.value})} />
                  <Input label="Emergency Contact Phone" value={profileData.emergency_contact_phone} onChange={(e) => setProfileData({...profileData, emergency_contact_phone: e.target.value})} />
                  
                  {/* Blood Group: only display if selected previously or user is editing */}
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Blood Group</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      value={profileData.blood_group} 
                      onChange={(e) => setProfileData({...profileData, blood_group: e.target.value})}
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                  </div>
                  <Input label="Height (cm)" type="number" value={profileData.height} onChange={(e) => setProfileData({...profileData, height: e.target.value})} />
                  <Input label="Weight (kg)" type="number" value={profileData.weight} onChange={(e) => setProfileData({...profileData, weight: e.target.value})} />
                  <Input label="Allergies (comma separated)" value={profileData.allergies} onChange={(e) => setProfileData({...profileData, allergies: e.target.value})} />
                  
                  <Input label="Insurance Provider" value={profileData.insurance_provider} onChange={(e) => setProfileData({...profileData, insurance_provider: e.target.value})} />
                  <Input label="Insurance ID" value={profileData.insurance_id} onChange={(e) => setProfileData({...profileData, insurance_id: e.target.value})} />
                  <div className="sm:col-span-2">
                    <label className="block text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Medical History</label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500" 
                        rows={3}
                        value={profileData.medical_history}
                        onChange={(e) => setProfileData({...profileData, medical_history: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save size={16} />}>
                        Save Profile
                    </Button>
                </div>
              </form>
            </Card>

            {/* Appearance */}
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><Sun size={16} className="text-accent-500" /></div>
                <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">Appearance</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      theme === value
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                        : 'border-border-light dark:border-border-dark hover:border-neutral-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <Icon size={20} className={theme === value ? 'text-accent-500' : 'text-neutral-400'} />
                    <span className={cn('text-body-sm font-semibold', theme === value ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-700 dark:text-neutral-300')}>{label}</span>
                    <span className="text-caption text-neutral-400 text-center leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Language */}
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><Globe size={16} className="text-accent-500" /></div>
                <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">Language</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANG_OPTIONS.map(({ value, label, flag }) => (
                  <button
                    key={value}
                    onClick={() => setLanguage(value)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                      language === value
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                        : 'border-border-light dark:border-border-dark hover:border-neutral-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <span className="text-2xl">{flag}</span>
                    <span className={cn('font-semibold text-body-md', language === value ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-700 dark:text-neutral-300')}>{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-caption text-neutral-400 mt-3">Full Hindi translation available in the next update.</p>
            </Card>

            {/* Notifications */}
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><Bell size={16} className="text-accent-500" /></div>
                <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">Notifications</h2>
              </div>
              <div className="space-y-0 divide-y divide-border-light dark:divide-border-dark">
                {NOTIFICATION_PREFS.map(item => (
                  <div key={item.label} className="flex items-center justify-between py-4 gap-4">
                    <div>
                      <p className="font-medium text-body-md text-neutral-900 dark:text-neutral-100">{item.label}</p>
                      <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                    </div>
                    <div className={cn('relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer',
                      item.checked ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    )}>
                      <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                        item.checked ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Privacy */}
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center"><Lock size={16} className="text-accent-500" /></div>
                <h2 className="font-manrope font-bold text-heading-md text-neutral-900 dark:text-neutral-100">Privacy</h2>
              </div>
              <div className="space-y-3">
                <Link to="/privacy" className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <p className="font-medium text-body-md text-neutral-900 dark:text-neutral-100">Privacy Policy</p>
                  <span className="text-neutral-400 text-body-sm">View →</span>
                </Link>
                <Link to="/terms" className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <p className="font-medium text-body-md text-neutral-900 dark:text-neutral-100">Terms of Service</p>
                  <span className="text-neutral-400 text-body-sm">View →</span>
                </Link>
                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors">
                  <p className="font-medium text-body-md">Delete Account</p>
                  <span className="text-body-sm">Request →</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
