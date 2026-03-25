import type { Conversation } from '../../../types/conversation'

interface Props {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  hasMore: boolean
  onSelect: (conversation: Conversation) => void
  onLoadMore: () => void
}

export default function ConversationList({
  conversations,
  selectedId,
  loading,
  hasMore,
  onSelect,
  onLoadMore,
}: Props) {
  if (!loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        暂无会话记录
      </div>
    )
  }

  return (
    <div className="overflow-y-auto flex-1">
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedId === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm text-gray-800 truncate">{conv.customerName}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${
                  conv.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {conv.status === 'open' ? '进行中' : '已结束'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">坐席：{conv.agentName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(conv.startedAt).toLocaleString('zh-CN')} · {conv.messageCount} 条消息
            </p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="p-3 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm text-blue-500 hover:underline disabled:text-gray-400"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
      {loading && conversations.length === 0 && (
        <div className="p-4 text-center text-sm text-gray-400">加载中...</div>
      )}
    </div>
  )
}
