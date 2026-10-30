import { createHash, randomBytes } from 'node:crypto'

import {
    trelloConnections,
    trelloOauthStates,
} from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { and, eq, lt } from 'drizzle-orm'

import { db } from '@/db/client'
import { getMe } from '@/services/trello/client'
import {
    getTrelloOAuthConfig,
    isTrelloConfigured,
    TRELLO_AUTHORIZE_URL,
    TRELLO_OAUTH_SCOPES,
    TRELLO_TOKEN_URL,
} from '@/services/trello/config'

const log = new Logger('api/trello/oauth')

const base64UrlEncode = (buffer: Buffer) =>
    buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

const createPkcePair = () => {
    const codeVerifier = base64UrlEncode(randomBytes(32))
    const codeChallenge = base64UrlEncode(
        createHash('sha256').update(codeVerifier).digest(),
    )
    return { codeVerifier, codeChallenge }
}

export async function getConnectionStatus(userId: string) {
    const configured = isTrelloConfigured()
    
    const [connection] = await db
        .select({
            id: trelloConnections.id,
            trelloMemberId: trelloConnections.trelloMemberId,
            trelloUsername: trelloConnections.trelloUsername,
            createdAt: trelloConnections.createdAt,
        })
        .from(trelloConnections)
        .where(eq(trelloConnections.userId, userId))
        .limit(1)
    
    return {
        configured,
        connected: Boolean(connection),
        connection: connection ?? null,
    }
}

export async function startAuthorize(userId: string, returnTeamSlug?: string) {
    const { clientId, redirectUri } = getTrelloOAuthConfig()
    const { codeVerifier, codeChallenge } = createPkcePair()
    const stateId = randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    await db
        .delete(trelloOauthStates)
        .where(eq(trelloOauthStates.userId, userId))
    
    await db.insert(trelloOauthStates).values({
        id: stateId,
        userId,
        codeVerifier,
        returnTeamId: returnTeamSlug || null,
        expiresAt,
    })
    
    const params = new URLSearchParams({
        client_id: clientId,
        scope: TRELLO_OAUTH_SCOPES,
        redirect_uri: redirectUri,
        response_type: 'code',
        prompt: 'consent',
        state: stateId,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    })
    
    return `${TRELLO_AUTHORIZE_URL}?${params.toString()}`
}

export async function handleOAuthCallback(code: string, state: string) {
    const { clientId, clientSecret, redirectUri, frontendOrigin } = getTrelloOAuthConfig()
    
    const [oauthState] = await db
        .select()
        .from(trelloOauthStates)
        .where(eq(trelloOauthStates.id, state))
        .limit(1)
    
    if (!oauthState)
        throw new Error('Invalid OAuth state')
    
    if (new Date(oauthState.expiresAt).getTime() < Date.now()) {
        await db.delete(trelloOauthStates).where(eq(trelloOauthStates.id, state))
        throw new Error('OAuth state expired')
    }
    
    const tokenResponse = await fetch(TRELLO_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code,
            code_verifier: oauthState.codeVerifier,
        }),
    })
    
    if (!tokenResponse.ok) {
        const text = await tokenResponse.text()
        log.e('Trello token exchange failed', tokenResponse.status, text)
        throw new Error('Failed to exchange Trello authorization code')
    }
    
    const tokens = await tokenResponse.json() as {
        access_token: string
        refresh_token: string
        expires_in: number
        scope?: string
    }
    
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    
    // Temporarily upsert with placeholder member id, then fetch /me
    await db
        .delete(trelloConnections)
        .where(eq(trelloConnections.userId, oauthState.userId))
    
    await db.insert(trelloConnections).values({
        userId: oauthState.userId,
        trelloMemberId: 'pending',
        trelloUsername: null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accessTokenExpiresAt: expiresAt,
        scope: tokens.scope ?? TRELLO_OAUTH_SCOPES,
    })
    
    const me = await getMe(oauthState.userId)
    
    await db
        .update(trelloConnections)
        .set({
            trelloMemberId: me.id,
            trelloUsername: me.username,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(trelloConnections.userId, oauthState.userId))
    
    await db.delete(trelloOauthStates).where(eq(trelloOauthStates.id, state))
    
    // Cleanup expired states opportunistically
    await db
        .delete(trelloOauthStates)
        .where(lt(trelloOauthStates.expiresAt, new Date().toISOString()))
    
    const returnPath = oauthState.returnTeamId
        ? `/t/${oauthState.returnTeamId}/settings?trello=connected`
        : '/settings?trello=connected'
    
    return {
        redirectUrl: `${frontendOrigin}${returnPath}`,
        userId: oauthState.userId,
    }
}

export async function disconnectTrello(userId: string) {
    await db
        .delete(trelloConnections)
        .where(eq(trelloConnections.userId, userId))
    
    await db
        .delete(trelloOauthStates)
        .where(eq(trelloOauthStates.userId, userId))
    
    return { ok: true }
}

export async function assertConnected(userId: string) {
    const [connection] = await db
        .select({ id: trelloConnections.id })
        .from(trelloConnections)
        .where(and(
            eq(trelloConnections.userId, userId),
        ))
        .limit(1)
    
    if (!connection)
        throw new Error('NotFound: Trello is not connected')
    
    return connection
}
