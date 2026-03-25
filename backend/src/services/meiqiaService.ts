import { config } from '../config.js'
import type { MeiqiaApiResponse, MeiqiaTokenData, MeiqiaConversation, MeiqiaMessage } from '../../../shared/types/meiqia.js'

// Token 内存缓存
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.value
  }

  const res = await fetch(`${config.MEIQIA_API_HOST}/2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: config.MEIQIA_APP_ID,
      app_secret: config.MEIQIA_APP_SECRET,
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch Meiqia token: ${res.status}`)
  }

  const json = (await res.json()) as MeiqiaApiResponse<MeiqiaTokenData>
  cachedToken = {
    value: json.data.token,
    expiresAt: Date.now() + json.data.expires_in * 1000,
  }

  return cachedToken.value
}

async function meiqiaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${config.MEIQIA_API_HOST}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    throw new Error(`Meiqia API error ${res.status}: ${path}`)
  }

  const json = (await res.json()) as MeiqiaApiResponse<T>
  return json.data
}

export interface ListConversationsParams {
  page?: number
  page_size?: number
  start_time?: number
  end_time?: number
  agent_id?: string
  status?: 'open' | 'closed'
}

export async function listConversations(params: ListConversationsParams): Promise<{ conversations: MeiqiaConversation[]; total: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))
  if (params.start_time) query.set('start_time', String(params.start_time))
  if (params.end_time) query.set('end_time', String(params.end_time))
  if (params.agent_id) query.set('agent_id', params.agent_id)
  if (params.status) query.set('status', params.status)

  return meiqiaFetch(`/2.0/conversations?${query.toString()}`)
}

export async function getConversation(id: string): Promise<MeiqiaConversation> {
  return meiqiaFetch(`/2.0/conversation/${id}`)
}

export async function getConversationMessages(
  id: string,
  params: { page?: number; page_size?: number },
): Promise<{ messages: MeiqiaMessage[]; total: number }> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))

  return meiqiaFetch(`/2.0/conversation/${id}/messages?${query.toString()}`)
}

export async function getClientToken(): Promise<string> {
  const data = await meiqiaFetch<{ token: string }>('/2.0/client/token', { method: 'POST' })
  return data.token
}
