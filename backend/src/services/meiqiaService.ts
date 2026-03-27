import { config } from '../config.js'
import type { MeiqiaConversation } from '../../../shared/types/meiqia.js'

const V1_BASE = `${config.MEIQIA_API_HOST}/v1`

async function meiqiaGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = new URLSearchParams({
    enterprise_id: config.MEIQIA_ENTERPRISE_ID,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })
  const res = await fetch(`${V1_BASE}${path}?${query}`, {
    headers: { Authorization: `Bearer ${config.MEIQIA_ACCESS_TOKEN}` },
  })
  if (!res.ok) {
    throw new Error(`Meiqia API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

export interface ListConversationsParams {
  page?: number
  page_size?: number
  start_time?: string  // 北京时间字符串 "YYYY-MM-DD HH:mm:ss"
  end_time?: string
}

export async function listConversations(
  params: ListConversationsParams
): Promise<MeiqiaConversation[]> {
  const limit = Math.min(params.page_size ?? 20, 20)
  const offset = ((params.page ?? 1) - 1) * limit
  const query: Record<string, string | number> = { offset, limit }
  if (params.start_time) query['conv_start_from_tm'] = params.start_time
  if (params.end_time) query['conv_start_to_tm'] = params.end_time

  const raw = await meiqiaGet<{ result: MeiqiaConversation[] }>('/conversations', query)
  return raw.result ?? []
}

export async function getConversation(id: string): Promise<MeiqiaConversation> {
  const raw = await meiqiaGet<{ result: MeiqiaConversation }>(`/conversations/${id}`, { conv_id: id })
  return raw.result
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
