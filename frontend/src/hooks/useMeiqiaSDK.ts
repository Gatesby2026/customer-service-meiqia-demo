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
        const res = await axios.get<{ token: string }>('/api/meiqia/client-token')
        if (cancelled) return

        // 等待 SDK 脚本加载完成
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

        _MEIQIA('init', { clientToken: res.data.token })
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
