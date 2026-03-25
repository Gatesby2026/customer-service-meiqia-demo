import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import * as conversationService from '../services/conversationService.js'

export const conversationsRouter = new Hono()

const listQuerySchema = z.object({
  page: z.string().optional().transform((v) => Number(v ?? '1')),
  page_size: z.string().optional().transform((v) => Number(v ?? '20')),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  agent_id: z.string().optional(),
  status: z.enum(['open', 'closed']).optional(),
})

const messagesQuerySchema = z.object({
  page: z.string().optional().transform((v) => Number(v ?? '1')),
  page_size: z.string().optional().transform((v) => Number(v ?? '20')),
})

// GET /api/conversations
conversationsRouter.get('/', async (c) => {
  const parsed = listQuerySchema.safeParse(c.req.query())
  if (!parsed.success) {
    throw new HTTPException(400, { message: 'Invalid query parameters' })
  }

  const { page, page_size, start_time, end_time, agent_id, status } = parsed.data
  const result = await conversationService.listConversations({
    page,
    pageSize: page_size,
    startTime: start_time,
    endTime: end_time,
    agentId: agent_id,
    status,
  })

  return c.json(result)
})

// GET /api/conversations/:id
conversationsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const conversation = await conversationService.getConversation(id)
  return c.json(conversation)
})

// GET /api/conversations/:id/messages
conversationsRouter.get('/:id/messages', async (c) => {
  const id = c.req.param('id')
  const parsed = messagesQuerySchema.safeParse(c.req.query())
  if (!parsed.success) {
    throw new HTTPException(400, { message: 'Invalid query parameters' })
  }

  const { page, page_size } = parsed.data
  const result = await conversationService.getConversationMessages(id, page, page_size)
  return c.json(result)
})
