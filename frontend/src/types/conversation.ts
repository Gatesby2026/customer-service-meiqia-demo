export type MessageType = 'text' | 'image' | 'file' | 'system_event'
export type ConversationStatus = 'open' | 'closed'

export interface Conversation {
  id: string
  status: ConversationStatus
  startedAt: string       // ISO 8601
  endedAt: string | null
  agentName: string
  customerName: string
  messageCount: number
}

export interface Message {
  id: string
  conversationId: string
  type: MessageType
  content: string
  senderRole: 'customer' | 'agent' | 'system'
  sentAt: string          // ISO 8601
}
