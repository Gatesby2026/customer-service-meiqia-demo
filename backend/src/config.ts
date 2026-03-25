import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'

// .env 在项目根目录（backend 的上级）
dotenvConfig({ path: resolve(import.meta.dirname, '../../.env') })

const envSchema = z.object({
  MEIQIA_APP_ID: z.string().min(1, 'MEIQIA_APP_ID is required'),
  MEIQIA_APP_SECRET: z.string().min(1, 'MEIQIA_APP_SECRET is required'),
  MEIQIA_API_HOST: z.string().url().default('https://api.meiqia.com'),
  PORT: z.string().default('8000'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
