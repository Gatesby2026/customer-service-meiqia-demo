import { useState, useCallback } from 'react'
import { fetchConversationMessages } from '../services/conversationService'
import { useConversationHistoryStore } from '../stores/conversationHistoryStore'
import type { Message } from '../types/conversation'

interface UseConversationMessagesResult {
  messages: Message[]
  loading: boolean
  load: (conversationId: string) => Promise<void>
}

export function useConversationMessages(): UseConversationMessagesResult {
  const [loading, setLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const { messagesByConversationId, setMessages } = useConversationHistoryStore()
  const messages = currentConversationId
    ? (messagesByConversationId[currentConversationId] ?? [])
    : []

  const load = useCallback(
    async (conversationId: string) => {
      setCurrentConversationId(conversationId)
      if (messagesByConversationId[conversationId]) return
      setLoading(true)
      try {
        const res = await fetchConversationMessages(conversationId, { page: 1, page_size: 50 })
        setMessages(conversationId, res.data)
      } finally {
        setLoading(false)
      }
    },
    [messagesByConversationId, setMessages]
  )

  return { messages, loading, load }
}
