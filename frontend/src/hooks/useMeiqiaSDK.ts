import { useEffect, useState } from 'react'
import axios from 'axios'

type SDKStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useMeiqiaSDK() {
  const [status, setStatus] = useState<SDKStatus>('idle')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    async function init() {
      try {
        // 1. 先创建 _MEIQIA 队列函数（必须在加载 SDK 脚本之前）
        const w = window as Window & { _MEIQIA?: ((...args: unknown[]) => void) & { a?: unknown[][] } }
        w._MEIQIA = w._MEIQIA ?? function (...args: unknown[]) {
          ;(w._MEIQIA!.a = w._MEIQIA!.a ?? []).push(args)
        }

        // 2. 从后端获取 App Key
        const res = await axios.get<{ appKey: string; enterpriseId: string }>('/api/meiqia/app-key')
        if (cancelled) return

        // 3. 设置 appid（企业ID，SDK 加载后自动执行）
        w._MEIQIA('appid', res.data.enterpriseId)

        // 4. 动态加载 SDK 脚本
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://static.meiqia.com/dist/meiqia.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Meiqia SDK script'))
          document.head.appendChild(script)
        })
        if (cancelled) return

        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          console.error('[MeiqiaSDK] init failed:', err)
          setStatus('error')
        }
      }
    }

    void init()
    return () => { cancelled = true }
  }, [])

  return { status }
}
