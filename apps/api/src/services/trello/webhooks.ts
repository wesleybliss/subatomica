import { createHmac } from 'node:crypto'

import {
    projects,
    taskLanes,
    tasks,
    trelloBoardLinks,
    trelloCardLinks,
    trelloConnections,
    trelloListLinks,
} from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { getCard, getList } from '@/services/trello/client'
import { getTrelloOAuthConfig } from '@/services/trello/config'

const log = new Logger('api/trello/webhooks')

type TrelloWebhookPayload = {
    action?: {
        type?: string
        data?: {
            card?: { id?: string, name?: string, idList?: string }
            list?: { id?: string, name?: string }
            board?: { id?: string }
            listAfter?: { id?: string }
            listBefore?: { id?: string }
            old?: Record<string, unknown>
        }
    }
    model?: {
        id?: string
    }
}

export function verifyTrelloWebhookSignature(
    rawBody: string,
    callbackURL: string,
    headerHash: string | undefined,
) {
    if (!headerHash)
        return false
    
    const { clientSecret } = getTrelloOAuthConfig()
    const content = rawBody + callbackURL
    const digest = createHmac('sha1', clientSecret)
        .update(content)
        .digest('base64')
    
    return digest === headerHash
}

async function findBoardLinkByTrelloBoardId(trelloBoardId: string) {
    const [link] = await db
        .select()
        .from(trelloBoardLinks)
        .where(and(
            eq(trelloBoardLinks.trelloBoardId, trelloBoardId),
            eq(trelloBoardLinks.syncEnabled, true),
        ))
        .limit(1)
    
    return link ?? null
}

async function ensureListLane(userId: string, boardLinkId: string, projectId: string, listId: string) {
    const [existing] = await db
        .select()
        .from(trelloListLinks)
        .where(eq(trelloListLinks.trelloListId, listId))
        .limit(1)
    
    if (existing) {
        const [lane] = await db
            .select()
            .from(taskLanes)
            .where(eq(taskLanes.id, existing.laneId))
            .limit(1)
        return lane ?? null
    }
    
    const list = await getList(userId, listId)
    if (!list || list.closed)
        return null
    
    const keyBase = list.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'lane'
    
    const existingLanes = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
    
    const used = new Set<string>(existingLanes.map((l: { key: string }) => l.key))
    let key = keyBase
    let i = 2
    while (used.has(key)) {
        key = `${keyBase}-${i}`
        i += 1
    }
    
    const [lane] = await db
        .insert(taskLanes)
        .values({
            projectId,
            key,
            name: list.name,
            order: existingLanes.length,
        })
        .returning()
    
    await db.insert(trelloListLinks).values({
        trelloListId: list.id,
        laneId: lane.id,
        boardLinkId,
    })
    
    return lane
}

async function upsertCardFromWebhook(userId: string, boardLink: typeof trelloBoardLinks.$inferSelect, cardId: string) {
    let card
    try {
        card = await getCard(userId, cardId)
    }
    catch (err) {
        log.e('Failed to fetch card for webhook', cardId, err)
        return
    }
    
    if (card.closed) {
        await deleteCardLink(cardId)
        return
    }
    
    const lane = await ensureListLane(userId, boardLink.id, boardLink.projectId, card.idList)
    const status = lane?.key || 'todo'
    const description = [
        card.desc || '',
        card.shortUrl || card.url ? `\n\n[Open in Trello](${card.shortUrl || card.url})` : '',
    ].join('').trim()
    
    const [existingLink] = await db
        .select()
        .from(trelloCardLinks)
        .where(eq(trelloCardLinks.trelloCardId, cardId))
        .limit(1)
    
    if (existingLink) {
        await db
            .update(tasks)
            .set({
                title: card.name,
                description,
                status,
                dueDate: card.due || null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(tasks.id, existingLink.taskId))
        return
    }
    
    const [project] = await db
        .select({ taskSequence: projects.taskSequence })
        .from(projects)
        .where(eq(projects.id, boardLink.projectId))
        .limit(1)
    
    const localId = project?.taskSequence ?? 1
    
    const [task] = await db
        .insert(tasks)
        .values({
            userId,
            projectId: boardLink.projectId,
            localId,
            title: card.name,
            description,
            status,
            dueDate: card.due || null,
            order: 0,
        })
        .returning()
    
    await db
        .update(projects)
        .set({
            taskSequence: localId + 1,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, boardLink.projectId))
    
    await db.insert(trelloCardLinks).values({
        trelloCardId: card.id,
        taskId: task.id,
        boardLinkId: boardLink.id,
    })
}

async function deleteCardLink(cardId: string) {
    const [link] = await db
        .select()
        .from(trelloCardLinks)
        .where(eq(trelloCardLinks.trelloCardId, cardId))
        .limit(1)
    
    if (!link)
        return
    
    await db.delete(tasks).where(eq(tasks.id, link.taskId))
    await db.delete(trelloCardLinks).where(eq(trelloCardLinks.id, link.id))
}

export async function handleWebhookPayload(payload: TrelloWebhookPayload) {
    const actionType = payload.action?.type
    const boardId = payload.action?.data?.board?.id || payload.model?.id
    
    if (!actionType || !boardId) {
        log.d('Ignoring webhook without action/board', actionType, boardId)
        return { ok: true, ignored: true }
    }
    
    const boardLink = await findBoardLinkByTrelloBoardId(boardId)
    if (!boardLink) {
        log.d('No sync-enabled board link for', boardId)
        return { ok: true, ignored: true }
    }
    
    const [connection] = await db
        .select()
        .from(trelloConnections)
        .where(eq(trelloConnections.userId, boardLink.userId))
        .limit(1)
    
    if (!connection) {
        log.e('Board link has no Trello connection', boardLink.id)
        return { ok: true, ignored: true }
    }
    
    const userId = boardLink.userId
    const cardId = payload.action?.data?.card?.id
    
    switch (actionType) {
        case 'createCard':
        case 'updateCard':
        case 'copyCard':
        case 'emailCard':
        case 'moveCardToBoard':
            if (cardId)
                await upsertCardFromWebhook(userId, boardLink, cardId)
            break
        
        case 'deleteCard':
        case 'moveCardFromBoard':
            if (cardId)
                await deleteCardLink(cardId)
            break
        
        case 'createList':
        case 'updateList':
            if (payload.action?.data?.list?.id) {
                await ensureListLane(
                    userId,
                    boardLink.id,
                    boardLink.projectId,
                    payload.action.data.list.id,
                )
            }
            break
        
        default:
            log.d('Unhandled Trello action', actionType)
    }
    
    await db
        .update(trelloBoardLinks)
        .set({
            lastSyncedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .where(eq(trelloBoardLinks.id, boardLink.id))
    
    return { ok: true }
}
