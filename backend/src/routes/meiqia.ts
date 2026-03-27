import { Hono } from 'hono'
import { config } from '../config.js'
import { getAppKey } from '../services/meiqiaService.js'

export const meiqiaRouter = new Hono()

// GET /api/meiqia/app-key — 供前端 SDK 初始化使用，不在前端硬编码
meiqiaRouter.get('/app-key', (c) => {
  return c.json({ appKey: getAppKey(), enterpriseId: config.MEIQIA_ENTERPRISE_ID })
})
