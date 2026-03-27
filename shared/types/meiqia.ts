/** 美洽会话原始字段（v1 API） */
export interface MeiqiaConversation {
  conv_id: number
  enterprise_id: number
  conv_start_tm: string      // 时间字符串
  conv_end_tm: string | null
  agent_name: string
  agent_nick_name: string
  agent_account: string
  conv_content: MeiqiaMessage[]
  conv_agent_msg_count: string
  conv_visitor_msg_count: string
  platform: string
  main_channel: string
  sub_channel: string
}

/** 美洽消息（嵌套在 conv_content 中） */
export interface MeiqiaMessage {
  from: string        // 'client' | 'agent' | 'system' 等
  timestamp: string   // 时间字符串
  content: string
  action_type: string // 消息类型
}

/** 美洽 Webhook 事件 */
export interface MeiqiaWebhookEvent {
  event: string
  timestamp: number
  data: Record<string, unknown>
}
