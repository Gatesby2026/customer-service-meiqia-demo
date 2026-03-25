import axios from 'axios'
import type { Conversation, Message, PaginatedResponse } from '../types/conversation'

export interface ConversationListParams {
  page?: number
  page_size?: number
  start_time?: string
  end_time?: string
  agent_id?: string
  status?: 'open' | 'closed'
}

export async function fetchConversations(
  params: ConversationListParams = {}
): Promise<PaginatedResponse<Conversation>> {
  const res = await axios.get<PaginatedResponse<Conversation>>('/api/conversations', { params })
  return res.data
}

export async function fetchConversationById(id: string): Promise<Conversation> {
  const res = await axios.get<Conversation>(`/api/conversations/${id}`)
  return res.data
}

export async function fetchConversationMessages(
  id: string,
  params: { page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<Message>> {
  const res = await axios.get<PaginatedResponse<Message>>(
    `/api/conversations/${id}/messages`,
    { params }
  )
  return res.data
}
