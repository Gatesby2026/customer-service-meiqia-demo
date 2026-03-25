import { useMeiqiaSDK } from '../hooks/useMeiqiaSDK'

export default function ChatPage() {
  const { status } = useMeiqiaSDK()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-4xl">💬</div>
        <h1 className="text-xl font-semibold text-gray-800">在线客服</h1>
        {status === 'loading' && (
          <p className="text-sm text-gray-400">正在连接客服，请稍候...</p>
        )}
        {status === 'ready' && (
          <p className="text-sm text-green-500">客服已就绪，请点击右下角开始对话</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400">连接失败，请刷新页面重试</p>
        )}
      </div>
    </div>
  )
}
