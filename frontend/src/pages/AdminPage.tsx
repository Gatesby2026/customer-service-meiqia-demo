import { useEffect, useState } from 'react'
import type { Conversation } from '../types/conversation'
import { useConversationHistory } from '../hooks/useConversationHistory'
import ConversationFilter from '../components/admin/ConversationHistory/ConversationFilter'
import ConversationList from '../components/admin/ConversationHistory/ConversationList'
import ConversationDetail from '../components/admin/ConversationHistory/ConversationDetail'

type Tab = 'history' | 'workspace'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('workspace')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { conversations, loading, hasMore, loadMore, applyFilters } = useConversationHistory()

  useEffect(() => {
    if (tab !== 'history') return
    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    void applyFilters({
      status: 'closed',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    })
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b px-6 shrink-0 flex items-center gap-6">
        <h1 className="font-semibold text-gray-800 py-3">美洽客服系统</h1>
        <nav className="flex gap-1 h-full">
          {([
            { key: 'workspace', label: '坐席工作台' },
            { key: 'history',   label: '历史对话' },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 text-sm border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 坐席工作台 */}
      <div className={`flex-1 overflow-hidden ${tab === 'workspace' ? 'block' : 'hidden'}`}>
        <iframe
          src="https://app.meiqia.com"
          className="w-full h-full border-0"
          title="美洽坐席工作台"
        />
      </div>

      {/* 历史对话 */}
      <div className={`flex flex-1 overflow-hidden ${tab === 'history' ? 'flex' : 'hidden'}`}>
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
