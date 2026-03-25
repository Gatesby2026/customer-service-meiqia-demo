import { useState } from 'react'
import type { Conversation } from '../../../types/conversation'
import { useConversationMessages } from '../../../hooks/useConversationMessages'
import MessageBubble from './MessageBubble'

interface Props {
  conversation: Conversation | null
}

export default function ConversationDetail({ conversation }: Props) {
  const [keyword, setKeyword] = useState('')
  const { messages, loading, load } = useConversationMessages()

  // 当会话切换时加载消息
  if (conversation && messages.length === 0 && !loading) {
    void load(conversation.id)
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        请从左侧选择一条会话
      </div>
    )
  }

  const filteredMessages = keyword
    ? messages.filter((m) => m.content.toLowerCase().includes(keyword.toLowerCase()))
    : messages

  return (
    <div className="flex flex-col h-full">
      {/* 会话头部信息 */}
      <div className="p-4 border-b bg-white shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-gray-800">{conversation.customerName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">坐席：{conversation.agentName}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              conversation.status === 'open'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {conversation.status === 'open' ? '进行中' : '已结束'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          开始：{new Date(conversation.startedAt).toLocaleString('zh-CN')}
          {conversation.endedAt && (
            <> &nbsp;·&nbsp; 结束：{new Date(conversation.endedAt).toLocaleString('zh-CN')}</>
          )}
        </p>
        {/* 关键字搜索 */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="在消息中搜索..."
          className="mt-3 w-full text-sm border rounded px-3 py-1.5 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* 消息时间线 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && (
          <div className="text-center text-sm text-gray-400 py-8">加载消息中...</div>
        )}
        {!loading && filteredMessages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            {keyword ? '未找到匹配消息' : '暂无消息'}
          </div>
        )}
        {filteredMessages.map((message) => (
          <MessageBubble key={message.id} message={message} highlight={keyword} />
        ))}
      </div>
    </div>
  )
}
