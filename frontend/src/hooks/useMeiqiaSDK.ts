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
        // 从后端获取 App Key（避免前端硬编码）
        const res = await axios.get<{ appKey: string }>('/api/meiqia/app-key')
        if (cancelled) return

        const waitForSDK = () =>
          new Promise<void>((resolve, reject) => {
            const maxWait = 5000
            const interval = 100
            let elapsed = 0
            const timer = setInterval(() => {
              if (typeof _MEIQIA !== 'undefined') {
                clearInterval(timer)
                resolve()
              } else if (elapsed >= maxWait) {
                clearInterval(timer)
                reject(new Error('Meiqia SDK load timeout'))
              }
              elapsed += interval
            }, interval)
          })

        await waitForSDK()
        if (cancelled) return

        _MEIQIA('init', { appKey: res.data.appKey })
        _MEIQIA('showPanel')
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
