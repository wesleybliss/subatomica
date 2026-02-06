import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/db/actions/shared'

export type BotAuthResult =
    | { type: 'apiKey' }
    | { type: 'session'; userId: string }
export async function requireBotAuth(): Promise<BotAuthResult> {
    const requestHeaders = await headers()
    const apiKey = requestHeaders.get('x-api-key')
    if (apiKey && process.env.BOT_API_KEY && apiKey === process.env.BOT_API_KEY)
        return { type: 'apiKey' }
    const user = await getCurrentUser()
    return { type: 'session', userId: user.id }
}
