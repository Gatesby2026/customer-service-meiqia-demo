import { Hono } from 'hono'
import { getClientToken } from '../services/meiqiaService.js'

export const meiqiaRouter = new Hono()

// GET /api/meiqia/client-token — 供前端 SDK 初始化使用，不暴露 App Secret
meiqiaRouter.get('/client-token', async (c) => {
  const token = await getClientToken()
  return c.json({ token })
})
