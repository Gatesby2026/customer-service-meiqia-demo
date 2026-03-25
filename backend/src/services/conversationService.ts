import type { Conversation, Message, MessageType, PaginatedResponse } from '../../../shared/types/conversation.js'
import type { MeiqiaConversation, MeiqiaMessage } from '../../../shared/types/meiqia.js'
import * as meiqiaService from './meiqiaService.js'

function mapConversation(raw: MeiqiaConversation): Conversation {
  return {
    id: raw.id,
    status: raw.status,
    startedAt: new Date(raw.created_at * 1000).toISOString(),
    endedAt: raw.ended_at ? new Date(raw.ended_at * 1000).toISOString() : null,
    agentName: raw.agent_name,
    customerName: raw.client_name,
    messageCount: raw.message_count,
  }
}

function mapMessageType(contentType: string): MessageType {
  switch (contentType) {
    case 'text':
      return 'text'
    case 'image':
      return 'image'
    case 'file':
      return 'file'
    default:
      return 'system_event'
  }
}

function mapMessage(raw: MeiqiaMessage): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    type: mapMessageType(raw.content_type),
    content: raw.content,
    senderRole: raw.sender_type === 'client' ? 'customer' : raw.sender_type,
    sentAt: new Date(raw.created_at * 1000).toISOString(),
  }
}

export interface ListConversationsQuery {
  page: number
  pageSize: number
  startTime?: string // ISO 8601，由路由层传入
  endTime?: string
  agentId?: string
  status?: 'open' | 'closed'
}

export async function listConversations(query: ListConversationsQuery): Promise<PaginatedResponse<Conversation>> {
  const result = await meiqiaService.listConversations({
    page: query.page,
    page_size: query.pageSize,
    start_time: query.startTime ? Math.floor(new Date(query.startTime).getTime() / 1000) : undefined,
    end_time: query.endTime ? Math.floor(new Date(query.endTime).getTime() / 1000) : undefined,
    agent_id: query.agentId,
    status: query.status,
  })

  const data = result.conversations.map(mapConversation)
  return {
    data,
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
    hasMore: query.page * query.pageSize < result.total,
  }
}

export async function getConversation(id: string): Promise<Conversation> {
  const raw = await meiqiaService.getConversation(id)
  return mapConversation(raw)
}

export async function getConversationMessages(
  id: string,
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Message>> {
  const result = await meiqiaService.getConversationMessages(id, { page, page_size: pageSize })
  const data = result.messages.map(mapMessage)
  return {
    data,
    page,
    pageSize,
    total: result.total,
    hasMore: page * pageSize < result.total,
  }
}
