import {
    projects,
    type TaskLane,
    taskLanes,
    tasks,
    teams,
    type TrelloBoardLink,
    trelloBoardLinks,
    type TrelloCardLink,
    trelloCardLinks,
    type TrelloListLink,
    trelloListLinks,
    trelloWorkspaceLinks,
} from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { generateSlug } from '@repo/shared/utils/slugs'
import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/client'
import { getAccessibleTeamIds } from '@/services/shared'
import * as teamsService from '@/services/teams'
import {
    createBoardWebhook,
    deleteWebhook,
    getBoardCards,
    getBoardLists,
    listBoards,
    listOrganizations,
    type TrelloBoard,
    type TrelloCard,
    type TrelloList,
} from '@/services/trello/client'
import {
    getTrelloOAuthConfig,
    TRELLO_PERSONAL_WORKSPACE_ID,
} from '@/services/trello/config'
import { assertConnected } from '@/services/trello/oauth'

const log = new Logger('api/trello/import')

export type WorkspaceMappingInput = {
    trelloWorkspaceId: string
    trelloWorkspaceName: string
    /** Existing team id, or omit / null to create */
    teamId?: string | null
    createTeamName?: string
}

export type BoardMappingInput = {
    trelloBoardId: string
    /** Resolved via workspace mapping; optional override */
    teamId?: string
    /** Existing project id, or omit to create */
    projectId?: string | null
    createProjectName?: string
    syncEnabled?: boolean
}

export type ImportRequest = {
    workspaceMappings: WorkspaceMappingInput[]
    boardMappings: BoardMappingInput[]
}

const normalizeName = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, ' ')

const slugifyKey = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'lane'

const laneKeyFromName = (name: string, used: Set<string>) => {
    let base = slugifyKey(name)
    if (base.length > 40)
        base = base.slice(0, 40)
    
    let key = base
    let i = 2
    while (used.has(key)) {
        key = `${base}-${i}`
        i += 1
    }
    used.add(key)
    return key
}

async function ensureUniqueProjectSlug(teamId: string, name: string) {
    const slug = generateSlug(name)
    const existing = await db
        .select({ slug: projects.slug })
        .from(projects)
        .where(eq(projects.teamId, teamId))
    
    const used = new Set(existing.map((p: { slug: string }) => p.slug))
    if (!used.has(slug))
        return slug
    
    let i = 2
    while (used.has(`${slug}-${i}`))
        i += 1
    return `${slug}-${i}`
}

async function assertTeamAccess(userId: string, teamId: string) {
    const accessible = getAccessibleTeamIds(userId)
    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.id, teamId), inArray(teams.id, accessible)))
        .limit(1)
    
    if (!team)
        throw new Error('NotFound: Team not found')
}

export async function getCatalog(userId: string, teamId: string) {
    await assertTeamAccess(userId, teamId)
    await assertConnected(teamId)
    
    const [orgs, boards, workspaceLinks, boardLinks, userTeams] = await Promise.all([
        listOrganizations(teamId),
        listBoards(teamId),
        db.select().from(trelloWorkspaceLinks).where(eq(trelloWorkspaceLinks.teamId, teamId)),
        db.select().from(trelloBoardLinks).where(eq(trelloBoardLinks.teamId, teamId)),
        teamsService.getUserTeams(userId),
    ])
    
    const openBoards = boards.filter(b => !b.closed)
    const personalBoards = openBoards.filter(b => !b.idOrganization)
    const workspaces = [
        ...orgs.map(org => ({
            id: org.id,
            name: org.displayName || org.name,
            isPersonal: false,
            boardCount: openBoards.filter(b => b.idOrganization === org.id).length,
        })),
        ...(personalBoards.length > 0
            ? [{
                id: TRELLO_PERSONAL_WORKSPACE_ID,
                name: 'Personal boards',
                isPersonal: true,
                boardCount: personalBoards.length,
            }]
            : []),
    ]
    
    return {
        workspaces,
        boards: openBoards.map((board: TrelloBoard) => ({
            id: board.id,
            name: board.name,
            desc: board.desc || '',
            url: board.shortUrl || board.url || '',
            trelloWorkspaceId: board.idOrganization || TRELLO_PERSONAL_WORKSPACE_ID,
            existingLink: boardLinks.find((l: TrelloBoardLink) => l.trelloBoardId === board.id) ?? null,
        })),
        workspaceLinks,
        boardLinks,
        teams: userTeams,
    }
}

async function resolveWorkspaceTeam(
    userId: string,
    connectionTeamId: string,
    mapping: WorkspaceMappingInput,
): Promise<string> {
    // Connection is per-team: always import into the team that owns the Trello link.
    const teamId = connectionTeamId
    await assertTeamAccess(userId, teamId)
    await upsertWorkspaceLink(userId, mapping.trelloWorkspaceId, mapping.trelloWorkspaceName, teamId)
    return teamId
}

async function upsertWorkspaceLink(
    userId: string,
    trelloWorkspaceId: string,
    trelloWorkspaceName: string,
    teamId: string,
) {
    const [existing] = await db
        .select()
        .from(trelloWorkspaceLinks)
        .where(and(
            eq(trelloWorkspaceLinks.teamId, teamId),
            eq(trelloWorkspaceLinks.trelloWorkspaceId, trelloWorkspaceId),
        ))
        .limit(1)
    
    if (existing) {
        await db
            .update(trelloWorkspaceLinks)
            .set({
                trelloWorkspaceName,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(trelloWorkspaceLinks.id, existing.id))
        return
    }
    
    await db.insert(trelloWorkspaceLinks).values({
        userId,
        trelloWorkspaceId,
        trelloWorkspaceName,
        teamId,
    })
}

async function resolveProject(
    userId: string,
    teamId: string,
    board: TrelloBoard,
    mapping: BoardMappingInput,
) {
    if (mapping.projectId) {
        const [project] = await db
            .select()
            .from(projects)
            .where(and(
                eq(projects.id, mapping.projectId),
                eq(projects.teamId, teamId),
            ))
            .limit(1)
        
        if (!project)
            throw new Error(`NotFound: Project ${mapping.projectId} not found in team`)
        
        return project
    }
    
    const [existingLink] = await db
        .select()
        .from(trelloBoardLinks)
        .where(eq(trelloBoardLinks.trelloBoardId, board.id))
        .limit(1)
    
    if (existingLink) {
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, existingLink.projectId))
            .limit(1)
        if (project)
            return project
    }
    
    const name = (mapping.createProjectName || board.name).trim()
    const slug = await ensureUniqueProjectSlug(teamId, name)
    
    const [project] = await db
        .insert(projects)
        .values({
            name,
            slug,
            description: board.desc || '',
            ownerId: userId,
            teamId,
        })
        .returning()
    
    return project
}

async function syncListsToLanes(
    projectId: string,
    boardLinkId: string,
    lists: TrelloList[],
) {
    let existingLanes: TaskLane[] = await db
        .select()
        .from(taskLanes)
        .where(eq(taskLanes.projectId, projectId))
    
    const existingListLinks: TrelloListLink[] = await db
        .select()
        .from(trelloListLinks)
        .where(eq(trelloListLinks.boardLinkId, boardLinkId))
    
    const usedKeys = new Set<string>(existingLanes.map(l => l.key))
    const listIdToLaneKey = new Map<string, string>()
    
    const sorted = [...lists]
        .filter(l => !l.closed)
        .sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0))
    
    // If project only has default empty lanes and we're first-importing, replace defaults
    const hasCardLinks: Array<{ id: string }> = await db
        .select({ id: trelloCardLinks.id })
        .from(trelloCardLinks)
        .where(eq(trelloCardLinks.boardLinkId, boardLinkId))
        .limit(1)
    
    const isFreshImport = existingListLinks.length === 0 && hasCardLinks.length === 0
    
    if (isFreshImport && existingLanes.length > 0) {
        const taskCount: Array<{ id: string }> = await db
            .select({ id: tasks.id })
            .from(tasks)
            .where(eq(tasks.projectId, projectId))
            .limit(1)
        
        if (taskCount.length === 0) {
            await db.delete(taskLanes).where(eq(taskLanes.projectId, projectId))
            existingLanes = []
            usedKeys.clear()
        }
    }
    
    for (let index = 0; index < sorted.length; index++) {
        const list = sorted[index]
        const existingLink = existingListLinks.find(l => l.trelloListId === list.id)
        
        if (existingLink) {
            const lane = existingLanes.find(l => l.id === existingLink.laneId)
            if (lane) {
                await db
                    .update(taskLanes)
                    .set({
                        name: list.name,
                        order: index,
                        updatedAt: new Date().toISOString(),
                    })
                    .where(eq(taskLanes.id, lane.id))
                listIdToLaneKey.set(list.id, lane.key)
                continue
            }
        }
        
        const matchedByName = existingLanes.find(
            l => normalizeName(l.name) === normalizeName(list.name),
        )
        
        if (matchedByName) {
            listIdToLaneKey.set(list.id, matchedByName.key)
            const alreadyLinked = existingListLinks.some(l => l.laneId === matchedByName.id)
            if (!alreadyLinked) {
                await db.insert(trelloListLinks).values({
                    trelloListId: list.id,
                    laneId: matchedByName.id,
                    boardLinkId,
                })
            }
            continue
        }
        
        const key = laneKeyFromName(list.name, usedKeys)
        const [lane] = await db
            .insert(taskLanes)
            .values({
                projectId,
                key,
                name: list.name,
                order: index,
                isDefault: index === 0,
            })
            .returning()
        
        existingLanes.push(lane)
        listIdToLaneKey.set(list.id, lane.key)
        
        await db.insert(trelloListLinks).values({
            trelloListId: list.id,
            laneId: lane.id,
            boardLinkId,
        })
    }
    
    // Ensure at least one lane
    if (listIdToLaneKey.size === 0) {
        const key = laneKeyFromName('todo', usedKeys)
        const [lane] = await db
            .insert(taskLanes)
            .values({
                projectId,
                key,
                name: 'To Do',
                order: 0,
                isDefault: true,
            })
            .returning()
        return { listIdToLaneKey, fallbackKey: lane.key }
    }
    
    return { listIdToLaneKey, fallbackKey: [...listIdToLaneKey.values()][0] }
}

async function syncCardsToTasks(
    userId: string,
    projectId: string,
    boardLinkId: string,
    cards: TrelloCard[],
    listIdToLaneKey: Map<string, string>,
    fallbackKey: string,
) {
    const existingCardLinks: TrelloCardLink[] = await db
        .select()
        .from(trelloCardLinks)
        .where(eq(trelloCardLinks.boardLinkId, boardLinkId))
    
    const [project] = await db
        .select({ taskSequence: projects.taskSequence })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    
    let sequence = project?.taskSequence ?? 1
    let imported = 0
    let updated = 0
    
    const openCards = cards
        .filter(c => !c.closed)
        .sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0))
    
    // Track next order per status
    const orderByStatus = new Map<string, number>()
    
    for (const card of openCards) {
        const status = listIdToLaneKey.get(card.idList) || fallbackKey
        const description = [
            card.desc || '',
            card.shortUrl || card.url ? `\n\n[Open in Trello](${card.shortUrl || card.url})` : '',
        ].join('').trim()
        
        const dueDate = card.due || null
        const existingLink = existingCardLinks.find((l: TrelloCardLink) => l.trelloCardId === card.id)
        
        if (existingLink) {
            await db
                .update(tasks)
                .set({
                    title: card.name,
                    description,
                    status,
                    dueDate,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(tasks.id, existingLink.taskId))
            updated += 1
            continue
        }
        
        const nextOrder = orderByStatus.get(status) ?? 0
        orderByStatus.set(status, nextOrder + 1)
        
        const [task] = await db
            .insert(tasks)
            .values({
                userId,
                projectId,
                localId: sequence,
                title: card.name,
                description,
                status,
                dueDate,
                order: nextOrder,
            })
            .returning()
        
        sequence += 1
        imported += 1
        
        await db.insert(trelloCardLinks).values({
            trelloCardId: card.id,
            taskId: task.id,
            boardLinkId,
        })
    }
    
    await db
        .update(projects)
        .set({
            taskSequence: sequence,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, projectId))
    
    return { imported, updated }
}

async function upsertBoardLink(params: {
    userId: string
    board: TrelloBoard
    projectId: string
    teamId: string
    syncEnabled: boolean
    webhookId?: string | null
}) {
    const workspaceId = params.board.idOrganization || TRELLO_PERSONAL_WORKSPACE_ID
    
    const [existing] = await db
        .select()
        .from(trelloBoardLinks)
        .where(eq(trelloBoardLinks.trelloBoardId, params.board.id))
        .limit(1)
    
    const now = new Date().toISOString()
    
    if (existing) {
        const [updated] = await db
            .update(trelloBoardLinks)
            .set({
                trelloBoardName: params.board.name,
                trelloWorkspaceId: workspaceId,
                projectId: params.projectId,
                teamId: params.teamId,
                syncEnabled: params.syncEnabled,
                webhookId: params.webhookId === undefined ? existing.webhookId : params.webhookId,
                lastSyncedAt: now,
                updatedAt: now,
            })
            .where(eq(trelloBoardLinks.id, existing.id))
            .returning()
        return updated
    }
    
    const [created] = await db
        .insert(trelloBoardLinks)
        .values({
            userId: params.userId,
            trelloBoardId: params.board.id,
            trelloBoardName: params.board.name,
            trelloWorkspaceId: workspaceId,
            projectId: params.projectId,
            teamId: params.teamId,
            syncEnabled: params.syncEnabled,
            webhookId: params.webhookId || null,
            lastSyncedAt: now,
        })
        .returning()
    
    return created
}

export async function runImport(userId: string, teamId: string, request: ImportRequest) {
    await assertTeamAccess(userId, teamId)
    await assertConnected(teamId)
    
    const boards = await listBoards(teamId)
    const boardById = new Map(boards.map(b => [b.id, b]))
    
    const workspaceTeamById = new Map<string, string>()
    
    for (const ws of request.workspaceMappings) {
        const resolvedTeamId = await resolveWorkspaceTeam(userId, teamId, ws)
        workspaceTeamById.set(ws.trelloWorkspaceId, resolvedTeamId)
    }
    
    const results = []
    
    for (const mapping of request.boardMappings) {
        const board = boardById.get(mapping.trelloBoardId)
        if (!board || board.closed) {
            results.push({
                trelloBoardId: mapping.trelloBoardId,
                ok: false,
                error: 'Board not found or closed',
            })
            continue
        }
        
        const workspaceId = board.idOrganization || TRELLO_PERSONAL_WORKSPACE_ID
        const resolvedTeamId = teamId
            || mapping.teamId
            || workspaceTeamById.get(workspaceId)
        
        if (!resolvedTeamId || resolvedTeamId !== teamId) {
            results.push({
                trelloBoardId: board.id,
                ok: false,
                error: 'Boards must import into the team that owns the Trello connection',
            })
            continue
        }
        
        try {
            const project = await resolveProject(userId, teamId, board, mapping)
            
            // Create board link early so list/card links can reference it
            let boardLink = await upsertBoardLink({
                userId,
                board,
                projectId: project.id,
                teamId,
                syncEnabled: Boolean(mapping.syncEnabled),
            })
            
            const [lists, cards] = await Promise.all([
                getBoardLists(teamId, board.id),
                getBoardCards(teamId, board.id),
            ])
            
            const { listIdToLaneKey, fallbackKey } = await syncListsToLanes(
                project.id,
                boardLink.id,
                lists,
            )
            
            const cardStats = await syncCardsToTasks(
                userId,
                project.id,
                boardLink.id,
                cards,
                listIdToLaneKey,
                fallbackKey,
            )
            
            // Webhook registration
            if (mapping.syncEnabled) {
                try {
                    const { webhookCallbackUrl } = getTrelloOAuthConfig()
                    if (boardLink.webhookId) {
                        try {
                            await deleteWebhook(teamId, boardLink.webhookId)
                        }
                        catch (err) {
                            log.e('Failed to delete old webhook', err)
                        }
                    }
                    const webhook = await createBoardWebhook(teamId, board.id, webhookCallbackUrl)
                    boardLink = await upsertBoardLink({
                        userId,
                        board,
                        projectId: project.id,
                        teamId,
                        syncEnabled: true,
                        webhookId: webhook.id,
                    })
                }
                catch (err) {
                    log.e('Failed to create webhook', err)
                    boardLink = await upsertBoardLink({
                        userId,
                        board,
                        projectId: project.id,
                        teamId,
                        syncEnabled: false,
                        webhookId: null,
                    })
                }
            }
            
            results.push({
                trelloBoardId: board.id,
                ok: true,
                projectId: project.id,
                projectSlug: project.slug,
                teamId,
                boardLinkId: boardLink.id,
                syncEnabled: boardLink.syncEnabled,
                ...cardStats,
            })
        }
        catch (err) {
            log.e('Board import failed', board.id, err)
            results.push({
                trelloBoardId: board.id,
                ok: false,
                error: err instanceof Error ? err.message : 'Import failed',
            })
        }
    }
    
    return { results }
}

export async function setBoardSync(userId: string, boardLinkId: string, syncEnabled: boolean) {
    const [link] = await db
        .select()
        .from(trelloBoardLinks)
        .where(eq(trelloBoardLinks.id, boardLinkId))
        .limit(1)
    
    if (!link)
        throw new Error('NotFound: Board link not found')
    
    await assertTeamAccess(userId, link.teamId)
    await assertConnected(link.teamId)
    
    if (!syncEnabled) {
        if (link.webhookId) {
            try {
                await deleteWebhook(link.teamId, link.webhookId)
            }
            catch (err) {
                log.e('Failed to delete webhook', err)
            }
        }
        
        const [updated] = await db
            .update(trelloBoardLinks)
            .set({
                syncEnabled: false,
                webhookId: null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(trelloBoardLinks.id, link.id))
            .returning()
        
        return updated
    }
    
    const { webhookCallbackUrl } = getTrelloOAuthConfig()
    if (link.webhookId) {
        try {
            await deleteWebhook(link.teamId, link.webhookId)
        }
        catch (err) {
            log.e('Failed to delete old webhook', err)
        }
    }
    
    const webhook = await createBoardWebhook(link.teamId, link.trelloBoardId, webhookCallbackUrl)
    
    const [updated] = await db
        .update(trelloBoardLinks)
        .set({
            syncEnabled: true,
            webhookId: webhook.id,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(trelloBoardLinks.id, link.id))
        .returning()
    
    return updated
}

export async function reSyncBoard(userId: string, boardLinkId: string) {
    const [link] = await db
        .select()
        .from(trelloBoardLinks)
        .where(eq(trelloBoardLinks.id, boardLinkId))
        .limit(1)
    
    if (!link)
        throw new Error('NotFound: Board link not found')
    
    await assertTeamAccess(userId, link.teamId)
    
    return runImport(userId, link.teamId, {
        workspaceMappings: [{
            trelloWorkspaceId: link.trelloWorkspaceId,
            trelloWorkspaceName: link.trelloWorkspaceId,
            teamId: link.teamId,
        }],
        boardMappings: [{
            trelloBoardId: link.trelloBoardId,
            teamId: link.teamId,
            projectId: link.projectId,
            syncEnabled: link.syncEnabled,
        }],
    })
}
