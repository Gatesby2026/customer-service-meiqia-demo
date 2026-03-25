import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { config } from '../config.js'

// TODO: 引入 jwt 库（如 hono/jwt）后替换此处简单实现
export const authMiddleware = createMiddleware(async (c, next) => {
  const authorization = c.req.header('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid Authorization header' })
  }

  const token = authorization.slice(7)
  // TODO: 使用 config.JWT_SECRET 验证 JWT，解码 payload 并挂载到 c.set('user', payload)
  if (!token || !config.JWT_SECRET) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  await next()
})
