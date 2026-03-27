import { config } from '../config.js'
import type { MeiqiaConversation, MeiqiaMessage } from '../../../shared/types/meiqia.js'

const API_BASE = `${config.MEIQIA_API_HOST}/unified-api/datagateway/v1`

async function meiqiaPost<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.MEIQIA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Meiqia API error ${res.status}: ${path}`)
  }

  return res.json() as Promise<T>
}

export interface ListConversationsParams {
  page?: number
  page_size?: number
  start_time?: number
  end_time?: number
  agent_id?: string
  status?: 'open' | 'closed'
}

export async function listConversations(
  params: ListConversationsParams
): Promise<{ conversations: MeiqiaConversation[]; total: number }> {
  const offset = ((params.page ?? 1) - 1) * (params.page_size ?? 20)
  return meiqiaPost('/conversations/list', {
    offset,
    limit: params.page_size ?? 20,
    ...(params.start_time ? { start_time: params.start_time } : {}),
    ...(params.end_time ? { end_time: params.end_time } : {}),
    ...(params.agent_id ? { agent_id: params.agent_id } : {}),
    ...(params.status ? { status: params.status } : {}),
  })
}

export async function getConversation(id: string): Promise<MeiqiaConversation> {
  return meiqiaPost(`/conversations/${id}`, {})
}

export async function getConversationMessages(
  id: string,
  params: { page?: number; page_size?: number }
): Promise<{ messages: MeiqiaMessage[]; total: number }> {
  const offset = ((params.page ?? 1) - 1) * (params.page_size ?? 20)
  return meiqiaPost(`/conversations/${id}/messages`, {
    offset,
    limit: params.page_size ?? 20,
  })
}

/** 返回 App Key，供前端 SDK 初始化使用 */
export function getAppKey(): string {
  return config.MEIQIA_APP_KEY
}

/** 获取坐席 SSO 登录 URL */
export async function getAgentSSOUrl(agentEmail: string): Promise<string> {
  const res = await fetch(`${config.MEIQIA_API_HOST}/unified-api/session/v1/sso/login-urls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.MEIQIA_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ agent_email: agentEmail }),
  })

  if (!res.ok) {
    throw new Error(`Meiqia SSO error ${res.status}`)
  }

  const data = await res.json() as { url: string }
  return data.url
}
