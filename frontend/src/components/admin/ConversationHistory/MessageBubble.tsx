import type { Message } from '../../../types/conversation'

interface Props {
  message: Message
  highlight?: string
}

export default function MessageBubble({ message, highlight }: Props) {
  const isCustomer = message.senderRole === 'customer'
  const isSystem = message.senderRole === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  function renderContent() {
    if (message.type === 'image') {
      return <img src={message.content} alt="图片消息" className="max-w-xs rounded" />
    }
    if (message.type === 'file') {
      return (
        <a href={message.content} target="_blank" rel="noreferrer" className="underline text-blue-600">
          下载附件
        </a>
      )
    }
    // text
    if (highlight) {
      const parts = message.content.split(new RegExp(`(${highlight})`, 'gi'))
      return (
        <p className="text-sm whitespace-pre-wrap">
          {parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase()
              ? <mark key={i} className="bg-yellow-200">{part}</mark>
              : part
          )}
        </p>
      )
    }
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
  }

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isCustomer
            ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
            : 'bg-blue-500 text-white rounded-tr-sm'
        }`}
      >
        {renderContent()}
        <p className={`text-xs mt-1 ${isCustomer ? 'text-gray-400' : 'text-blue-200'}`}>
          {new Date(message.sentAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
