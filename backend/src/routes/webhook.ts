import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createHmac } from 'crypto'
import { config } from '../config.js'
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

  if (!verifySignature(rawBody, signature)) {
    throw new HTTPException(401, { message: 'Invalid webhook signature' })
  }

  const event = JSON.parse(rawBody) as MeiqiaWebhookEvent

  // TODO: 根据 event.event 类型分发处理逻辑
  console.log('[Webhook] Received event:', event.event)

  return c.json({ ok: true })
})
