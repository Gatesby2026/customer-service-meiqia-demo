import { useEffect, useState } from 'react'
import axios from 'axios'

interface HealthResponse {
  status: string
  message: string
}

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('检查中...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get<HealthResponse>('/api/health')
      .then((res) => setBackendStatus(res.data.message))
      .catch(() => setError('无法连接到后端服务，请确认后端已启动'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800">美洽客服系统</h1>
        <p className="text-gray-500 text-sm">Meiqia Customer Service Demo</p>
        <div className="mt-6 p-4 rounded-lg bg-gray-100 text-sm">
          <span className="font-medium text-gray-600">后端状态：</span>
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <span className="text-green-600">{backendStatus}</span>
          )}
        </div>
      </div>
    </div>
  )
}
