import { useEffect } from 'react'
import { Activity, Server, Database, Brain, HardDrive, Cpu, Users } from 'lucide-react'
import Card from '../ui/Card'
import { Badge } from '../ui'
import { useAnalyticsStore } from '../../stores/analyticsStore'

export default function SystemModule() {
  const { metrics, fetchMetrics, subscribeToMetrics } = useAnalyticsStore()

  useEffect(() => {
    fetchMetrics()
    const unsubscribe = subscribeToMetrics()
    return () => {
      unsubscribe()
    }
  }, [fetchMetrics, subscribeToMetrics])

  if (!metrics) {
    return <div className="p-8 text-center text-neutral-500">Loading system metrics...</div>
  }

  const STATUS_CONFIG = {
    healthy: { color: 'success', label: 'Healthy' },
    degraded: { color: 'warning', label: 'Degraded' },
    down: { color: 'danger', label: 'Down' },
  } as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-manrope font-bold text-heading-lg text-neutral-900 dark:text-neutral-100">System Health Monitor</h2>
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-caption text-neutral-500 font-medium">Live Updates</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real-time stats */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-blue-500" />
            <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-400">CPU Usage</span>
          </div>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">{metrics.cpu_usage}%</span>
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${metrics.cpu_usage}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-purple-500" />
            <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-400">Memory Usage</span>
          </div>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100">{metrics.memory_usage}%</span>
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${metrics.memory_usage}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-emerald-500" />
            <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-400">Active Users</span>
          </div>
          <span className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mt-auto">{metrics.active_users}</span>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={18} className="text-amber-500" />
            <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-400">Storage Usage</span>
          </div>
          <span className="font-manrope font-bold text-display-sm text-neutral-900 dark:text-neutral-100 mt-auto">{metrics.storage_usage_gb} GB</span>
        </Card>
      </div>

      <h3 className="font-semibold text-heading-md text-neutral-900 dark:text-neutral-100 pt-4">Service Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Server size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Main Server</p>
              <p className="text-caption text-neutral-500">API & Routing</p>
            </div>
          </div>
          <Badge variant={STATUS_CONFIG[metrics.server_status].color as any} dot>{STATUS_CONFIG[metrics.server_status].label}</Badge>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <Database size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Supabase DB</p>
              <p className="text-caption text-neutral-500">PostgreSQL Instance</p>
            </div>
          </div>
          <Badge variant={STATUS_CONFIG[metrics.database_status].color as any} dot>{STATUS_CONFIG[metrics.database_status].label}</Badge>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <Brain size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">AI Services</p>
              <p className="text-caption text-neutral-500">Prediction & Assistant</p>
            </div>
          </div>
          <Badge variant={STATUS_CONFIG[metrics.ai_status].color as any} dot>{STATUS_CONFIG[metrics.ai_status].label}</Badge>
        </Card>
      </div>
    </div>
  )
}
