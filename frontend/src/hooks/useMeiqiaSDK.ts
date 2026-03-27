import { useEffect, useState } from 'react'
import axios from 'axios'

type SDKStatus = 'idle' | 'loading' | 'ready' | 'error'

interface Options {
  openid?: string
}

export function useMeiqiaSDK({ openid }: Options = {}) {
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

        // 2. 从后端获取企业 ID
        const res = await axios.get<{ appKey: string; enterpriseId: string }>('/api/meiqia/app-key')
        if (cancelled) return

        // 3. 设置 entId
        w._MEIQIA('entId', res.data.enterpriseId)

        // 4. 如果有微信 openID，设置为自定义用户信息
        if (openid) {
          w._MEIQIA('setMetaData', { wechat_openid: openid })
          w._MEIQIA('identifyVisitor', { name: openid })
        }

        // 5. 动态加载 SDK 脚本
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://static.meiqia.com/widget/loader.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Meiqia SDK script'))
          document.head.appendChild(script)
        })
        if (cancelled) return

        // 6. 自动打开对话面板
        w._MEIQIA('showPanel')

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
  }, [openid])

  return { status }
}
