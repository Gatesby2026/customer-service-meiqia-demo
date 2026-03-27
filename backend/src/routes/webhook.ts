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
  console.log('[Webhook] event:', event.event, JSON.stringify(event.data))

  if (event.event === 'conv_close') {
    const convId = String((event.data as { conv_id?: unknown }).conv_id ?? '')
    if (convId) {
      // 异步同步，不阻塞 webhook 响应
      syncConversation(convId).catch((err: unknown) => {
        console.error('[Webhook] sync failed for conv', convId, err)
      })
    }
  }

  return c.json({ ok: true })
})
