import { useEffect, useState } from 'react'
import type { Conversation } from '../types/conversation'
import { useConversationHistory } from '../hooks/useConversationHistory'
import ConversationFilter from '../components/admin/ConversationHistory/ConversationFilter'
import ConversationList from '../components/admin/ConversationHistory/ConversationList'
import ConversationDetail from '../components/admin/ConversationHistory/ConversationDetail'

export default function AdminPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { conversations, loading, hasMore, loadMore, applyFilters } = useConversationHistory()

  // 默认加载最近 7 天已结束会话
  useEffect(() => {
    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    void applyFilters({
      status: 'closed',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-3 shrink-0 flex items-center gap-3">
        <h1 className="font-semibold text-gray-800">美洽客服系统</h1>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">历史对话</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex flex-col bg-white border-r shrink-0">
          <ConversationFilter onFilter={applyFilters} />
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id ?? null}
            loading={loading}
            hasMore={hasMore}
            onSelect={(conv) => setSelectedConversation(conv)}
            onLoadMore={loadMore}
          />
        </aside>

        <main className="flex-1 overflow-hidden">
          <ConversationDetail
            conversation={selectedConversation}
            key={selectedConversation?.id}
          />
        </main>
      </div>
    </div>
  )
}
