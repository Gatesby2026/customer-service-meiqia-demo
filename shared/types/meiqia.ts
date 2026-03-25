/** 美洽 API 响应基础结构 */
export interface MeiqiaApiResponse<T> {
  status: number
  message: string
  data: T
}

/** 美洽 access token 响应 */
export interface MeiqiaTokenData {
  token: string
  expires_in: number // 秒，通常 7200
}

/** 美洽会话（原始结构） */
export interface MeiqiaConversation {
  id: string
  status: 'open' | 'closed'
  created_at: number // Unix 时间戳
  ended_at: number | null
  agent_name: string
  client_name: string
  message_count: number
}

/** 美洽消息（原始结构） */
export interface MeiqiaMessage {
  id: string
  conversation_id: string
  content_type: string // 'text' | 'image' | 'file' | ...
  content: string
  sender_type: 'client' | 'agent' | 'system'
  created_at: number // Unix 时间戳
}

/** 美洽 Webhook 事件 */
export interface MeiqiaWebhookEvent {
  event: string
  timestamp: number
  data: Record<string, unknown>
}
