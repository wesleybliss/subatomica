import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

console.log('@debug', JSON.stringify({
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
}))

export const { GET, POST } = toNextJsHandler(auth)
