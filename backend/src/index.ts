import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { config } from './config.js'
import { conversationsRouter } from './routes/conversations.js'
import { meiqiaRouter } from './routes/meiqia.js'
import { webhookRouter } from './routes/webhook.js'

const app = new Hono()

// 中间件
app.use('*', logger())
app.use('/api/*', cors({ origin: 'http://localhost:5173' }))

// 路由
app.route('/api/conversations', conversationsRouter)
app.route('/api/meiqia', meiqiaRouter)
app.route('/api/webhook', webhookRouter)

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 统一错误处理
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error('[Unhandled Error]', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

serve({ fetch: app.fetch, port: Number(config.PORT) }, (info) => {
  console.log(`Backend running on http://localhost:${info.port}`)
})

export default app
