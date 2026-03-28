import { db } from '../db.js'
import { getConversation } from './meiqiaService.js'
import type { MeiqiaMessage } from '../../../shared/types/meiqia.js'

function mapMessageType(contentType: string): string {
  if (contentType === 'image') return 'image'
  if (contentType === 'file') return 'file'
  if (contentType === 'system') return 'system_event'
  return 'text'
}

const upsertConv = db.prepare(`
  INSERT OR REPLACE INTO conversations
    (id, status, started_at, ended_at, agent_name, customer_name, platform, message_count, synced_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const upsertMsg = db.prepare(`
  INSERT OR REPLACE INTO messages
    (id, conversation_id, type, content, sender_role, sent_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertMessages = db.transaction((convId: string, messages: MeiqiaMessage[]) => {
  messages.forEach((m, i) => {
    const senderRole = m.from === 'client' ? 'customer' : m.from === 'agent' ? 'agent' : 'system'
    upsertMsg.run(`${convId}-${i}`, convId, mapMessageType(m.content_type), m.content, senderRole, m.timestamp)
  })
})

export async function syncConversation(convId: string): Promise<void> {
  const raw = await getConversation(convId)
  const msgCount = (Number(raw.conv_agent_msg_count) || 0) + (Number(raw.conv_visitor_msg_count) || 0)

  upsertConv.run(
    String(raw.conv_id),
    raw.conv_end_tm ? 'closed' : 'open',
    raw.conv_start_tm,
    raw.conv_end_tm ?? null,
    raw.agent_nick_name || raw.agent_name,
    raw.client_info?.name || raw.client_info?.visitor_name || '顾客',
    raw.platform ?? '',
    msgCount,
    new Date().toISOString(),
  )

  insertMessages(String(raw.conv_id), raw.conv_content ?? [])

  console.log(`[Sync] conv ${convId}: ${(raw.conv_content ?? []).length} messages stored`)
}
