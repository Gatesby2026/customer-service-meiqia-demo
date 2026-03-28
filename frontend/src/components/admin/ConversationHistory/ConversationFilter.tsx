import { useState } from 'react'
import type { ConversationListParams } from '../../../services/conversationService'

interface Props {
  initialValues?: Pick<ConversationListParams, 'start_time' | 'end_time' | 'status'>
  onFilter: (params: ConversationListParams) => void
}

export default function ConversationFilter({ initialValues, onFilter }: Props) {
  const [startTime, setStartTime] = useState(initialValues?.start_time?.slice(0, 16) ?? '')
  const [endTime, setEndTime] = useState(initialValues?.end_time?.slice(0, 16) ?? '')
  const [status, setStatus] = useState<'open' | 'closed' | ''>(initialValues?.status ?? '')
  const [agentId, setAgentId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onFilter({
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      status: status || undefined,
      agent_id: agentId || undefined,
    })
  }

  function handleReset() {
    setStartTime('')
    setEndTime('')
    setStatus('')
    setAgentId('')
    onFilter({})
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">开始时间</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">结束时间</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">状态</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'open' | 'closed' | '')}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">全部</option>
          <option value="open">进行中</option>
          <option value="closed">已结束</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">坐席 ID</label>
        <input
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          placeholder="留空表示全部"
          className="text-sm border rounded px-2 py-1 w-32"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
          筛选
        </button>
        <button type="button" onClick={handleReset} className="text-sm border px-3 py-1 rounded hover:bg-gray-50">
          重置
        </button>
      </div>
    </form>
  )
}
