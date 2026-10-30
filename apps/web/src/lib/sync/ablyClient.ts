import Logger from '@repo/shared/utils/logger'
import * as Ably from 'ably'

import { request } from '@/lib/api/client'
import { ablyDebugLog } from '@/lib/sync/ablyDebugLog'

const log = new Logger('web/lib/sync/ablyClient')

type InvalidatePayload = {
    keys?: string[]
    projectId?: string
    at?: string
    source?: string
}

let realtime: Ably.Realtime | null = null

/** Drop the shared realtime connection (e.g. when the Ably UI toggle is off). */
export function disconnectAbly() {
    if (!realtime) return
    ablyDebugLog.push({
        direction: 'out',
        kind: 'disconnect',
        summary: 'Closing Ably realtime connection',
    })
    realtime.close()
    realtime = null
}

export async function subscribeProjectInvalidates(
    projectId: string,
    onInvalidate: (payload: InvalidatePayload) => void,
): Promise<() => void> {
    const channelName = `project:${projectId}`
    
    try {
        ablyDebugLog.push({
            direction: 'out',
            kind: 'token-request',
            channel: channelName,
            summary: 'Requesting Ably token',
            payload: { projectIds: [projectId] },
        })
        
        const token = await request<{
            enabled: boolean
            tokenRequest?: Ably.TokenRequest
        }>('/sync/ably-token', {
            method: 'POST',
            body: JSON.stringify({ projectIds: [projectId] }),
        })
        
        if (!token.enabled || !token.tokenRequest) {
            ablyDebugLog.push({
                direction: 'in',
                kind: 'token-disabled',
                channel: channelName,
                summary: 'Ably disabled or not configured',
            })
            log.d('Ably disabled or not configured')
            return () => {}
        }
        
        ablyDebugLog.push({
            direction: 'in',
            kind: 'token-ok',
            channel: channelName,
            summary: 'Received Ably token request',
            payload: {
                clientId: token.tokenRequest.clientId,
                capability: token.tokenRequest.capability,
            },
        })
        
        if (!realtime) {
            realtime = new Ably.Realtime({
                authCallback: async (_params, callback) => {
                    try {
                        ablyDebugLog.push({
                            direction: 'out',
                            kind: 'token-refresh',
                            summary: 'Refreshing Ably token',
                        })
                        const next = await request<{
                            enabled: boolean
                            tokenRequest?: Ably.TokenRequest
                        }>('/sync/ably-token', {
                            method: 'POST',
                            body: JSON.stringify({ projectIds: [projectId] }),
                        })
                        if (!next.tokenRequest) {
                            callback('No token', null)
                            return
                        }
                        callback(null, next.tokenRequest)
                    } catch (error) {
                        callback(error instanceof Error ? error.message : 'auth failed', null)
                    }
                },
            })
            
            realtime.connection.on(stateChange => {
                ablyDebugLog.push({
                    direction: 'in',
                    kind: 'connection',
                    summary: `Connection ${stateChange.current}`,
                    payload: {
                        previous: stateChange.previous,
                        current: stateChange.current,
                        reason: stateChange.reason?.message,
                    },
                })
            })
        }
        
        const channel = realtime.channels.get(channelName)
        
        ablyDebugLog.push({
            direction: 'out',
            kind: 'subscribe',
            channel: channelName,
            summary: `Subscribe ${channelName}#invalidate`,
        })
        
        const handler = (message: Ably.Message) => {
            const data = (message.data || {}) as InvalidatePayload
            ablyDebugLog.push({
                direction: 'in',
                kind: 'invalidate',
                channel: channelName,
                summary: `invalidate ← ${data.source ?? 'unknown'} keys=${(data.keys || []).join(',')}`,
                payload: data,
            })
            onInvalidate(data)
        }
        channel.subscribe('invalidate', handler)
        
        return () => {
            channel.unsubscribe('invalidate', handler)
            ablyDebugLog.push({
                direction: 'out',
                kind: 'unsubscribe',
                channel: channelName,
                summary: `Unsubscribe ${channelName}#invalidate`,
            })
        }
    } catch (error) {
        ablyDebugLog.push({
            direction: 'in',
            kind: 'error',
            channel: channelName,
            summary: error instanceof Error ? error.message : 'Ably subscribe failed',
        })
        log.w('Ably subscribe failed', error)
        return () => {}
    }
}
