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
  const [workspaceUrl, setWorkspaceUrl] = useState<string | null>(null)
  const [ssoError, setSsoError] = useState(false)
  const { conversations, loading, hasMore, loadMore, applyFilters } = useConversationHistory()

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const [defaultFilters] = useState<ConversationListParams>({
    status: 'closed',
    start_time: toLocalDT(todayStart),
    end_time: toLocalDT(new Date()),
  })
  // 每次切换到工作台时重新获取 SSO URL（临时链接，有效期短）
  useEffect(() => {
    if (tab !== 'workspace' || !agentEmail) return
    setWorkspaceUrl(null)
    setSsoError(false)
    axios.post<{ loginUrl: string }>('/api/meiqia/sso-url', { email: agentEmail })
      .then((res) => setWorkspaceUrl(res.data.loginUrl))
      .catch(() => setSsoError(true))
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
      <div className={`flex-1 overflow-hidden ${tab === 'workspace' ? 'block' : 'hidden'}`}>
        {ssoError ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            工作台加载失败，请
            <button onClick={handleLogout} className="text-blue-500 ml-1">重新登录</button>
          </div>
        ) : workspaceUrl ? (
          <iframe
            src={workspaceUrl}
            className="w-full h-full border-0"
            title="美洽坐席工作台"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            加载中...
          </div>
        )}
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
