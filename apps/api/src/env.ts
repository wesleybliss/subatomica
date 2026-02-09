import { z } from 'zod'
import auth from '@/services/auth'
import { OpenAPIHono } from '@hono/zod-openapi'

const EnvSchema = z.object({
    DATABASE_URL: z.string().url(),
})

export const env = EnvSchema.parse(process.env)

// These types only apply to the API project
export type ApiAppEnv = {
    Variables: {
        user: typeof auth.$Infer.Session.user | null
        session: typeof auth.$Infer.Session.session | null
    }
}

export const createApp = () => new OpenAPIHono<ApiAppEnv>()
