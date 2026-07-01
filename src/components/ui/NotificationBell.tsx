import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X } from 'lucide-react'
import { cn, timeAgo } from '../../lib/utils'
import { useNotificationStore } from '../../stores/notificationStore'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, subscribeToNotifications } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const unsub = subscribeToNotifications()
    return () => unsub()
  }, [fetchNotifications, subscribeToNotifications])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative z-50" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-neutral-900" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-[400px] bg-white dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-2xl shadow-soft-lg flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
                <p className="text-xs text-neutral-500">You have {unreadCount} unread messages</p>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => markAllAsRead()} className="text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-border-light dark:divide-border-dark">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex gap-3",
                        !n.read ? 'bg-accent-50/30 dark:bg-accent-500/5' : ''
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={cn("text-sm font-medium", !n.read ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-300")}>
                            {n.title}
                          </p>
                          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="flex-shrink-0 p-1 text-accent-500 hover:bg-accent-100 dark:hover:bg-accent-500/20 rounded-md self-start" title="Mark as read">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
