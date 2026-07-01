import { useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotificationStore } from '../../../stores/notificationStore'
import { cn, timeAgo } from '../../../lib/utils'
import Button from '../../../components/ui/Button'

export function NotificationsSection() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications } =
    useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    const unsubscribe = subscribeToNotifications()
    return () => unsubscribe()
  }, [])

  const unread = notifications.filter(n => !n.read)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">
            Notifications
          </h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {unread.length > 0
              ? `You have ${unread.length} unread notification${unread.length > 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={14} className="mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border-light dark:border-border-dark animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Bell size={28} className="text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">No notifications yet</p>
            <p className="text-body-sm text-neutral-400 mt-1">We'll notify you about appointments, reports and more.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={cn(
                'flex gap-4 p-4 rounded-2xl border transition-all duration-200',
                n.read
                  ? 'bg-white dark:bg-neutral-900 border-border-light dark:border-border-dark hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-default'
                  : 'bg-accent-50 dark:bg-accent-500/10 border-accent-200 dark:border-accent-500/20 cursor-pointer hover:bg-accent-100 dark:hover:bg-accent-500/20'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                n.read ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-accent-100 dark:bg-accent-500/20'
              )}>
                <Bell size={18} className={n.read ? 'text-neutral-400' : 'text-accent-500'} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{n.title}</p>
                <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mt-0.5">{n.message}</p>
                <p className="text-caption text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-accent-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}