import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { config } from '../config.js'
import { getAppKey, getAgentSSOUrl } from '../services/meiqiaService.js'

export const meiqiaRouter = new Hono()

// GET /api/meiqia/app-key — 供前端 SDK 初始化使用，不在前端硬编码
meiqiaRouter.get('/app-key', (c) => {
  return c.json({ appKey: getAppKey(), enterpriseId: config.MEIQIA_ENTERPRISE_ID })
})

// POST /api/meiqia/sso-url — 获取坐席 SSO 登录 URL
meiqiaRouter.post(
  '/sso-url',
  zValidator('json', z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid('json')
    const loginUrl = await getAgentSSOUrl(email)
    return c.json({ loginUrl })
  }
)
