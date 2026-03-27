import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import type { Conversation } from '../types/conversation'
import type { ConversationListParams } from '../services/conversationService'
import { useConversationHistory } from '../hooks/useConversationHistory'
import ConversationFilter from '../components/admin/ConversationHistory/ConversationFilter'
import ConversationList from '../components/admin/ConversationHistory/ConversationList'
import ConversationDetail from '../components/admin/ConversationHistory/ConversationDetail'

type Tab = 'history' | 'workspace'

function toLocalDT(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export default function AdminPage() {
  const navigate = useNavigate()
  const agentEmail = sessionStorage.getItem('agentEmail') ?? ''
  const [tab, setTab] = useState<Tab>('workspace')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [ssoUrl, setSsoUrl] = useState<string | null>(null)
  const { conversations, loading, hasMore, loadMore, applyFilters } = useConversationHistory()

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const [defaultFilters] = useState<ConversationListParams>({
    status: 'closed',
    start_time: toLocalDT(todayStart),
    end_time: toLocalDT(new Date()),
  })
  // 切换到工作台时预取 SSO URL，供手动触发登录使用
  useEffect(() => {
    if (tab !== 'workspace' || !agentEmail) return
    axios.post<{ loginUrl: string }>('/api/meiqia/sso-url', { email: agentEmail })
      .then((res) => setSsoUrl(res.data.loginUrl))
      .catch(() => setSsoUrl(null))
  }, [tab, agentEmail])

  useEffect(() => {
    if (tab !== 'history') return
    void applyFilters(defaultFilters)
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    sessionStorage.removeItem('agentEmail')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b px-6 shrink-0 flex items-center gap-6">
        <h1 className="font-semibold text-gray-800 py-3">美洽客服系统</h1>
        <nav className="flex gap-1 h-full flex-1">
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
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500">{agentEmail}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 py-3"
          >
            退出
          </button>
        </div>
      </header>

      {/* 坐席工作台 */}
      <div className={`flex-1 overflow-hidden flex flex-col ${tab === 'workspace' ? 'flex' : 'hidden'}`}>
        {/* SSO 快速登录提示栏 */}
        {ssoUrl && (
          <div className="shrink-0 bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-3 text-sm">
            <span className="text-blue-700">首次使用或 session 过期？</span>
            <a
              href={ssoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              点此 SSO 登录
            </a>
            <span className="text-blue-400">（登录后刷新页面即可）</span>
          </div>
        )}
        <iframe
          src="https://app.meiqia.com"
          className="flex-1 border-0 w-full"
          title="美洽坐席工作台"
          allow="storage-access; camera; microphone; clipboard-write"
        />
      </div>

      {/* 历史对话 */}
      <div className={`flex flex-1 overflow-hidden ${tab === 'history' ? 'flex' : 'hidden'}`}>
        <aside className="w-80 flex flex-col bg-white border-r shrink-0">
          <ConversationFilter initialValues={defaultFilters} onFilter={applyFilters} />
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
