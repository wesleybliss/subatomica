import Logger from '@repo/shared/utils/logger'
import Ably from 'ably'

const log = new Logger('api/lib/ably')

let restClient: Ably.Rest | null = null

const getRest = () => {
    const key = process.env.ABLY_API_KEY
    if (!key) return null
    if (!restClient)
        restClient = new Ably.Rest({ key })
    return restClient
}

/**
 * Server-side Ably is opt-in: set ABLY_ENABLED=true plus ABLY_API_KEY.
 * Keeps free-tier quiet while developing with only the API key present.
 */
export const isAblyConfigured = () =>
    Boolean(process.env.ABLY_API_KEY) && process.env.ABLY_ENABLED === 'true'

export const projectChannelName = (projectId: string) => `project:${projectId}`

export async function publishProjectInvalidate(
    projectId: string,
    payload: { keys: string[]; source?: string },
) {
    const rest = getRest()
    if (!rest) return
    
    try {
        const channel = rest.channels.get(projectChannelName(projectId))
        await channel.publish('invalidate', {
            ...payload,
            projectId,
            at: new Date().toISOString(),
        })
    } catch (error) {
        log.w('Failed to publish Ably invalidate', error)
    }
}

export async function createAblyTokenRequest(clientId: string, projectIds: string[]) {
    const rest = getRest()
    if (!rest)
        throw new Error('Ably is not configured')
    
    const capability: Record<string, string[]> = {}
    for (const projectId of projectIds)
        capability[projectChannelName(projectId)] = ['subscribe']
    
    return rest.auth.createTokenRequest({
        clientId,
        capability: JSON.stringify(capability),
        ttl: 60 * 60 * 1000,
    })
}
