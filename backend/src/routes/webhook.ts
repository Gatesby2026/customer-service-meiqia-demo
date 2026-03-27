import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createHmac } from 'crypto'
import { config } from '../config.js'
import { syncConversation } from '../services/syncService.js'
import type { MeiqiaWebhookEvent } from '../../../shared/types/meiqia.js'

export const webhookRouter = new Hono()

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac('sha256', config.MEIQIA_APP_SECRET).update(body).digest('hex')
  return expected === signature
}

// POST /api/webhook/meiqia
webhookRouter.post('/meiqia', async (c) => {
  const signature = c.req.header('X-Meiqia-Signature') ?? ''
  const rawBody = await c.req.text()

  // APP_SECRET 未配置时跳过验签（开发阶段），配置后强制验签
  if (config.MEIQIA_APP_SECRET && !verifySignature(rawBody, signature)) {
    throw new HTTPException(401, { message: 'Invalid webhook signature' })
  }

  const event = JSON.parse(rawBody) as MeiqiaWebhookEvent
  console.log('[Webhook] full body:', rawBody)

  if (event.event === 'conversation.closed') {
    // 尝试从各种可能的位置取 conv_id
    const payload = event as unknown as Record<string, unknown>
    const convId = String(
      (payload.data as Record<string, unknown> | undefined)?.conv_id
      ?? payload.conv_id
      ?? ''
    )
    console.log('[Webhook] conv_id extracted:', convId)
    if (convId) {
      syncConversation(convId).catch((err: unknown) => {
        console.error('[Webhook] sync failed for conv', convId, err)
      })
    }
  }

  return c.json({ ok: true })
})
