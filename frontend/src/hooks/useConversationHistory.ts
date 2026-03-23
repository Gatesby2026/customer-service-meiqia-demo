import { useState, useCallback } from 'react'
import { fetchConversations, type ConversationListParams } from '../services/conversationService'
import { useConversationHistoryStore } from '../stores/conversationHistoryStore'
import type { Conversation } from '../types/conversation'

interface UseConversationHistoryResult {
  conversations: Conversation[]
  loading: boolean
  hasMore: boolean
  page: number
  filters: ConversationListParams
  loadMore: () => Promise<void>
  applyFilters: (filters: ConversationListParams) => Promise<void>
}

export function useConversationHistory(): UseConversationHistoryResult {
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ConversationListParams>({})

  const { conversations, setConversations } = useConversationHistoryStore()

  const load = useCallback(
    async (nextPage: number, nextFilters: ConversationListParams, reset: boolean) => {
      setLoading(true)
      try {
        const res = await fetchConversations({
          ...nextFilters,
          page: nextPage,
          page_size: 20,
        })
        setConversations(reset ? res.data : [...conversations, ...res.data])
        setHasMore(nextPage * 20 < res.total)
        setPage(nextPage)
      } finally {
        setLoading(false)
      }
    },
    [conversations, setConversations]
  )

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await load(page + 1, filters, false)
    }
  }, [loading, hasMore, page, filters, load])

  const applyFilters = useCallback(
    async (newFilters: ConversationListParams) => {
      setFilters(newFilters)
      await load(1, newFilters, true)
    },
    [load]
  )

  return { conversations, loading, hasMore, page, filters, loadMore, applyFilters }
}
