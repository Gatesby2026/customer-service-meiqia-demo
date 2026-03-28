import { useMeiqiaSDK } from '../hooks/useMeiqiaSDK'

export default function ChatPage() {
  // 从 URL 读取微信 openID（微信网页授权后追加到 URL）
  const openid = new URLSearchParams(window.location.search).get('openid') ?? undefined
  const { status } = useMeiqiaSDK({ openid })

  // 连接失败时才显示提示，其余时候保持空白（SDK 面板会自动覆盖）
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-red-400">连接失败，请刷新页面重试</p>
      </div>
    )
  }

  return <div className="min-h-screen bg-white" />
}
