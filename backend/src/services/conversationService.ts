import type { Conversation, Message, MessageType, PaginatedResponse } from '../../../shared/types/conversation.js'
import type { MeiqiaConversation, MeiqiaMessage } from '../../../shared/types/meiqia.js'
import * as meiqiaService from './meiqiaService.js'
import { db } from '../db.js'

function mapConversation(raw: MeiqiaConversation): Conversation {
  const msgCount = (Number(raw.conv_agent_msg_count) || 0) + (Number(raw.conv_visitor_msg_count) || 0)
  return {
    id: String(raw.conv_id),
    status: raw.conv_end_tm ? 'closed' : 'open',
    startedAt: raw.conv_start_tm,
    endedAt: raw.conv_end_tm ?? null,
    agentName: raw.agent_nick_name || raw.agent_name,
    customerName: raw.client_info?.name || raw.client_info?.visitor_name || '顾客',
    messageCount: msgCount,
  }
}

function mapMessageType(contentType: string): MessageType {
  if (contentType === 'image') return 'image'
  if (contentType === 'file') return 'file'
  if (contentType === 'system') return 'system_event'
  return 'text'
}

function mapMessage(raw: MeiqiaMessage, conversationId: string, index: number): Message {
  const senderRole = raw.from === 'client' ? 'customer'
    : raw.from === 'agent' ? 'agent'
    : 'system'
  return {
    id: `${conversationId}-${index}`,
    conversationId,
    type: mapMessageType(raw.content_type),
    content: raw.content,
    senderRole,
    sentAt: raw.timestamp,
  }
}

// ── 本地 DB 行类型 ──────────────────────────────────────────────────────────
interface DbConversation {
  id: string; status: string; started_at: string; ended_at: string | null
  agent_name: string; customer_name: string; platform: string; message_count: number
}
interface DbMessage {
  id: string; conversation_id: string; type: string; content: string
  sender_role: string; sent_at: string
}

function dbConvToConversation(row: DbConversation): Conversation {
  return {
    id: row.id,
    status: row.status as 'open' | 'closed',
    startedAt: row.started_at,
    endedAt: row.ended_at,
    agentName: row.agent_name,
    customerName: row.customer_name,
    messageCount: row.message_count,
  }
}

function dbMsgToMessage(row: DbMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    type: row.type as MessageType,
    content: row.content,
    senderRole: row.sender_role as 'customer' | 'agent' | 'system',
    sentAt: row.sent_at,
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
  // 前端传来的是本地时间字符串（北京时间），直接转成美洽要求的 "YYYY-MM-DD HH:mm:ss" 格式
  function toMeiqiaTm(s: string) { return s.replace('T', ' ').slice(0, 19) }
  const conversations = await meiqiaService.listConversations({
    page: query.page,
    page_size: query.pageSize,
    start_time: query.startTime ? toMeiqiaTm(query.startTime) : undefined,
    end_time: query.endTime ? toMeiqiaTm(query.endTime) : undefined,
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
  // 优先从本地库查（webhook 同步后可用，速度快且不受 API 限流影响）
  const localRows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at')
    .all(id) as DbMessage[]

  if (localRows.length > 0) {
    const start = (page - 1) * pageSize
    const data = localRows.slice(start, start + pageSize).map(dbMsgToMessage)
    return { data, page, pageSize, total: localRows.length, hasMore: start + pageSize < localRows.length }
  }

  // 本地无数据，fallback 到美洽 API
  const raw = await meiqiaService.getConversation(id)
  const allMessages = (raw.conv_content ?? []).map((m, i) => mapMessage(m, id, i))
  const start = (page - 1) * pageSize
  const data = allMessages.slice(start, start + pageSize)
  return { data, page, pageSize, total: allMessages.length, hasMore: start + pageSize < allMessages.length }
}
