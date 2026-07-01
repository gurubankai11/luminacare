import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string | null
  attachment: string | null
  read: boolean
  created_at: string
}

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  activeConversation: string | null
  fetchMessages: (userId1: string, userId2: string) => Promise<void>
  sendMessage: (message: string, receiverId: string) => Promise<void>
  subscribeToMessages: (userId1: string, userId2: string) => (() => void)
  setActiveConversation: (receiverId: string | null) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  activeConversation: null,

  setActiveConversation: (id) => set({ activeConversation: id }),

  fetchMessages: async (userId1, userId2) => {
    set({ isLoading: true, activeConversation: userId2 })
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      set({ messages: (data ?? []) as ChatMessage[] })
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  sendMessage: async (messageText, receiverId) => {
    const { activeConversation } = get()
    if (!activeConversation) return
    const sender = useAuthStore.getState().user
    if (!sender) return

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: sender.id,
        receiver_id: receiverId,
        message: messageText,
        read: false
      })
      if (error) throw error
      // Realtime subscription handles the UI update
    } catch (error) {
      console.error('Error sending message:', error)
    }
  },

  subscribeToMessages: (userId1, userId2) => {
    const channel = supabase.channel(`chat_${userId1}_${userId2}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as ChatMessage
          if (
            (msg.sender_id === userId1 && msg.receiver_id === userId2) ||
            (msg.sender_id === userId2 && msg.receiver_id === userId1)
          ) {
            set((state) => ({ messages: [...state.messages, msg] }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
