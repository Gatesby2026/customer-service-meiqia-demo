import type { Conversation, Message, MessageType, PaginatedResponse } from '../../../shared/types/conversation.js'
import type { MeiqiaConversation, MeiqiaMessage } from '../../../shared/types/meiqia.js'
import * as meiqiaService from './meiqiaService.js'

function mapConversation(raw: MeiqiaConversation): Conversation {
  const msgCount = (Number(raw.conv_agent_msg_count) || 0) + (Number(raw.conv_visitor_msg_count) || 0)
  return {
    id: String(raw.conv_id),
    status: raw.conv_end_tm ? 'closed' : 'open',
    startedAt: raw.conv_start_tm,
    endedAt: raw.conv_end_tm ?? null,
    agentName: raw.agent_nick_name || raw.agent_name,
    customerName: raw.platform || '顾客',
    messageCount: msgCount,
  }
}

function mapMessageType(actionType: string): MessageType {
  if (actionType === 'image') return 'image'
  if (actionType === 'file') return 'file'
  if (actionType === 'system') return 'system_event'
  return 'text'
}

function mapMessage(raw: MeiqiaMessage, conversationId: string, index: number): Message {
  const senderRole = raw.from === 'client' ? 'customer'
    : raw.from === 'agent' ? 'agent'
    : 'system'
  return {
    id: `${conversationId}-${index}`,
    conversationId,
    type: mapMessageType(raw.action_type),
    content: raw.content,
    senderRole,
    sentAt: raw.timestamp,
  }
}

export interface ListConversationsQuery {
  page: number
  pageSize: number
  startTime?: string  // ISO 8601
  endTime?: string
  agentId?: string
  status?: 'open' | 'closed'
}

export async function listConversations(query: ListConversationsQuery): Promise<PaginatedResponse<Conversation>> {
  const conversations = await meiqiaService.listConversations({
    page: query.page,
    page_size: query.pageSize,
    start_time: query.startTime ? Math.floor(new Date(query.startTime).getTime() / 1000) : undefined,
    end_time: query.endTime ? Math.floor(new Date(query.endTime).getTime() / 1000) : undefined,
  })

  let data = conversations.map(mapConversation)

  // 客户端过滤 status（API 不支持该参数）
  if (query.status) {
    data = data.filter((c) => c.status === query.status)
  }

  const hasMore = data.length >= query.pageSize
  return { data, page: query.page, pageSize: query.pageSize, total: data.length, hasMore }
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
  const raw = await meiqiaService.getConversation(id)
  const allMessages = (raw.conv_content ?? []).map((m, i) => mapMessage(m, id, i))
  const start = (page - 1) * pageSize
  const data = allMessages.slice(start, start + pageSize)
  return {
    data,
    page,
    pageSize,
    total: allMessages.length,
    hasMore: start + pageSize < allMessages.length,
  }
}
