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
  const [workspaceWin, setWorkspaceWin] = useState<Window | null>(null)
  const { conversations, loading, hasMore, loadMore, applyFilters } = useConversationHistory()

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const [defaultFilters] = useState<ConversationListParams>({
    status: 'closed',
    start_time: toLocalDT(todayStart),
    end_time: toLocalDT(new Date()),
  })

  // 切换到工作台时获取 SSO URL 并自动弹出工作台窗口
  useEffect(() => {
    if (tab !== 'workspace' || !agentEmail) return
    axios.post<{ loginUrl: string }>('/api/meiqia/sso-url', { email: agentEmail })
      .then((res) => {
        setSsoUrl(res.data.loginUrl)
        openWorkspace(res.data.loginUrl)
      })
      .catch(() => setSsoUrl(null))
  }, [tab, agentEmail]) // eslint-disable-line react-hooks/exhaustive-deps

  function openWorkspace(url: string) {
    const w = 1280
    const h = 800
    const left = Math.max(0, (screen.width - w) / 2)
    const top = Math.max(0, (screen.height - h) / 2)
    const win = window.open(url, 'meiqia-workspace', `width=${w},height=${h},left=${left},top=${top},resizable=yes`)
    setWorkspaceWin(win)
  }

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
      <div className={`flex-1 overflow-hidden flex flex-col items-center justify-center bg-gray-50 ${tab === 'workspace' ? 'flex' : 'hidden'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-600 text-sm mb-1">坐席工作台已在独立窗口打开</p>
          <p className="text-gray-400 text-xs mb-6">如被浏览器拦截或窗口已关闭，请点击下方按钮重新打开</p>
          {ssoUrl ? (
            <button
              onClick={() => openWorkspace(ssoUrl)}
              className="bg-blue-500 text-white px-5 py-2 rounded text-sm hover:bg-blue-600"
            >
              重新打开坐席工作台
            </button>
          ) : (
            <span className="text-gray-400 text-sm">加载中...</span>
          )}
          {workspaceWin && !workspaceWin.closed && (
            <p className="mt-3 text-green-600 text-xs">工作台窗口已打开 ✓</p>
          )}
        </div>
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
