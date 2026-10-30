import {
    trelloConnections,
} from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import {
    getTrelloOAuthConfig,
    TRELLO_API_BASE,
    TRELLO_TOKEN_URL,
} from '@/services/trello/config'

const log = new Logger('api/trello/client')

export type TrelloMember = {
    id: string
    username: string
    fullName?: string
    email?: string | null
}

export type TrelloOrganization = {
    id: string
    name: string
    displayName: string
}

export type TrelloBoard = {
    id: string
    name: string
    desc?: string
    closed?: boolean
    idOrganization?: string | null
    url?: string
    shortUrl?: string
}

export type TrelloList = {
    id: string
    name: string
    closed?: boolean
    pos?: number
    idBoard: string
}

export type TrelloCard = {
    id: string
    name: string
    desc?: string
    closed?: boolean
    due?: string | null
    idList: string
    idBoard: string
    idMembers?: string[]
    pos?: number
    url?: string
    shortUrl?: string
}

type TokenResponse = {
    access_token: string
    refresh_token: string
    expires_in: number
    scope?: string
}

async function refreshAccessToken(connectionId: string, refreshToken: string): Promise<TokenResponse> {
    const { clientId, clientSecret } = getTrelloOAuthConfig()
    
    const response = await fetch(TRELLO_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    })
    
    if (!response.ok) {
        const text = await response.text()
        log.e('Failed to refresh Trello token', response.status, text)
        throw new Error('Failed to refresh Trello access token')
    }
    
    const tokens = await response.json() as TokenResponse
    
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    
    await db
        .update(trelloConnections)
        .set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpiresAt: expiresAt,
            scope: tokens.scope ?? undefined,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(trelloConnections.id, connectionId))
    
    return tokens
}

export async function getValidAccessToken(teamId: string): Promise<string> {
    const [connection] = await db
        .select()
        .from(trelloConnections)
        .where(eq(trelloConnections.teamId, teamId))
        .limit(1)
    
    if (!connection)
        throw new Error('NotFound: Trello is not connected for this team')
    
    const expiresAt = new Date(connection.accessTokenExpiresAt).getTime()
    const skewMs = 60_000
    
    if (Date.now() < expiresAt - skewMs)
        return connection.accessToken
    
    const tokens = await refreshAccessToken(connection.id, connection.refreshToken)
    return tokens.access_token
}

async function trelloFetch<T>(teamId: string, path: string, init?: RequestInit): Promise<T> {
    const accessToken = await getValidAccessToken(teamId)
    const url = path.startsWith('http') ? path : `${TRELLO_API_BASE}${path}`
    
    const response = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            ...init?.headers,
        },
    })
    
    if (!response.ok) {
        const text = await response.text()
        log.e('Trello API error', path, response.status, text)
        throw new Error(`Trello API error: ${response.status}`)
    }
    
    if (response.status === 204)
        return undefined as T
    
    return await response.json() as T
}

export async function getMe(teamId: string) {
    return trelloFetch<TrelloMember>(
        teamId,
        '/members/me?fields=id,username,fullName,email',
    )
}

export async function getBoardMembers(teamId: string, boardId: string) {
    return trelloFetch<TrelloMember[]>(
        teamId,
        `/boards/${boardId}/members?fields=id,username,fullName`,
    )
}

export async function listOrganizations(teamId: string) {
    return trelloFetch<TrelloOrganization[]>(
        teamId,
        '/members/me/organizations?fields=id,name,displayName',
    )
}

export async function listBoards(teamId: string) {
    return trelloFetch<TrelloBoard[]>(
        teamId,
        '/members/me/boards?fields=id,name,desc,closed,idOrganization,url,shortUrl&filter=open',
    )
}

export async function getBoardLists(teamId: string, boardId: string) {
    return trelloFetch<TrelloList[]>(
        teamId,
        `/boards/${boardId}/lists?fields=id,name,closed,pos,idBoard&filter=open`,
    )
}

export async function getBoardCards(teamId: string, boardId: string) {
    return trelloFetch<TrelloCard[]>(
        teamId,
        `/boards/${boardId}/cards?fields=id,name,desc,closed,due,idList,idBoard,idMembers,pos,url,shortUrl&filter=open`,
    )
}

export async function getCard(teamId: string, cardId: string) {
    return trelloFetch<TrelloCard>(
        teamId,
        `/cards/${cardId}?fields=id,name,desc,closed,due,idList,idBoard,idMembers,pos,url,shortUrl`,
    )
}

export async function getList(teamId: string, listId: string) {
    return trelloFetch<TrelloList>(
        teamId,
        `/lists/${listId}?fields=id,name,closed,pos,idBoard`,
    )
}

export async function createBoardWebhook(teamId: string, boardId: string, callbackURL: string) {
    return trelloFetch<{ id: string }>(teamId, '/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callbackURL,
            idModel: boardId,
            description: `Subatomica sync for board ${boardId}`,
        }),
    })
}

export async function deleteWebhook(teamId: string, webhookId: string) {
    return trelloFetch<void>(teamId, `/webhooks/${webhookId}`, {
        method: 'DELETE',
    })
}
