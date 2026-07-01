import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, Send, Paperclip } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { Avatar } from '../../../components/ui'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useChatStore } from '../../../stores/chatStore'
import { useAppointmentStore } from '../../../stores/appointmentStore'
import { cn, formatTime } from '../../../lib/utils'

export function ChatSection() {
  const { messages, fetchMessages, sendMessage, subscribeToMessages } = useChatStore()
  const { user } = useAuthStore()
  const { appointments } = useAppointmentStore()
  const [message, setMessage] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')

  // Extract unique doctors from appointments
  const uniqueDoctors = Array.from(
    new Map(
      appointments
        .filter(a => a.doctor_id && a.doctor)
        .map(a => [a.doctor_id, { id: a.doctor_id, name: a.doctor!.name }])
    ).values()
  )

  useEffect(() => {
    if (!selectedDoctorId && uniqueDoctors.length > 0) {
      setSelectedDoctorId(uniqueDoctors[0].id)
    }
  }, [uniqueDoctors, selectedDoctorId])

  const doctorName = uniqueDoctors.find(d => d.id === selectedDoctorId)?.name || 'Assigned Doctor'

  useEffect(() => {
    if (user?.id && selectedDoctorId) {
      fetchMessages(user.id, selectedDoctorId)
      const unsubscribe = subscribeToMessages(user.id, selectedDoctorId)
      return () => unsubscribe()
    }
  }, [fetchMessages, subscribeToMessages, user?.id, selectedDoctorId])

  const handleSend = () => {
    if (!message.trim() || !selectedDoctorId) return
    sendMessage(message, selectedDoctorId)
    setMessage('')
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl">Chat</h1>
        {uniqueDoctors.length > 1 && (
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="input max-w-xs py-1.5"
          >
            {uniqueDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        )}
      </div>
      <Card className="flex-1 flex flex-col">
        {!selectedDoctorId ? (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            <p>Please book an appointment to chat with a doctor.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-border-light dark:border-border-dark">
              <Avatar name={doctorName} status="online" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{doctorName}</p>
                <p className="text-caption text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Online</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 py-4 overflow-y-auto min-h-[300px] max-h-[400px]">
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id
                return (
                  <div key={msg.id} className={cn('flex gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
                    {!isMe && <Avatar name={doctorName} size="sm" />}
                    <div className={cn('max-w-xs rounded-2xl px-4 py-3 text-body-sm',
                      isMe
                        ? 'bg-accent-500 text-white rounded-tr-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm'
                    )}>
                      <p>{msg.message}</p>
                      <p className={cn('text-xs mt-1', isMe ? 'text-blue-100' : 'text-neutral-400')}>{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark">
              <button className="p-2 rounded-xl text-neutral-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-colors">
                <Paperclip size={18} />
              </button>
              <div className="flex-1">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              <Button variant="primary" size="sm" className="rounded-xl" rightIcon={<Send size={14} />} onClick={handleSend}>
                Send
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}